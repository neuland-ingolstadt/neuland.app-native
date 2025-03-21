import NeulandAPI from '@/api/neuland-api';
import { NoSessionError } from '@/api/thi-session-handler';
import ErrorView from '@/components/Error/ErrorView';
import GradesRow from '@/components/Rows/GradesRow';
import Divider from '@/components/Universal/Divider';
import LoadingIndicator from '@/components/Universal/LoadingIndicator';
import SectionView from '@/components/Universal/SectionsView';
import { useRefreshByUser } from '@/hooks';
import type { GradeAverage } from '@/types/utils';
import {
	extractSpoName,
	getPersonalData,
	networkError
} from '@/utils/api-utils';
import { loadGradeAverage, loadGrades } from '@/utils/grades-utils';
import { LoadingState } from '@/utils/ui-utils';
import { useQuery } from '@tanstack/react-query';
import { router, useNavigation } from 'expo-router';
import Fuse from 'fuse.js';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	AppState,
	type AppStateStatus,
	Platform,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import packageInfo from '../../../package.json';

export default function GradesSCreen(): React.JSX.Element {
	const { t } = useTranslation('settings');
	const { styles, theme } = useStyles(stylesheet);
	const [gradeAverage, setGradeAverage] = useState<GradeAverage>();
	const navigation = useNavigation();
	const [localSearch, setLocalSearch] = React.useState('');

	useLayoutEffect(() => {
		navigation.setOptions({
			headerSearchBarOptions: {
				placeholder: t('navigation.grades.search', {
					ns: 'navigation'
				}),

				...Platform.select({
					android: {
						headerIconColor: theme.colors.text,
						hintTextColor: theme.colors.text,
						textColor: theme.colors.text
					}
				}),

				onChangeText: (event: { nativeEvent: { text: string } }) => {
					const text = event.nativeEvent.text;
					setLocalSearch(text);
				}
			}
		});
	}, [navigation]);

	const [averageLoadingState, setAverageLoadingState] = useState<LoadingState>(
		LoadingState.LOADING
	);

	/**
	 * Loads the average grade from the API and sets the state accordingly.
	 * @returns {Promise<void>} A promise that resolves when the average grade has been loaded.
	 */
	async function loadAverageGrade(spoName: string | undefined): Promise<void> {
		if (isSpoLoading) {
			return;
		}
		try {
			const average = await loadGradeAverage(spoWeights, spoName);
			if (average.result !== undefined && average.result !== null) {
				setGradeAverage(average);
				setAverageLoadingState(LoadingState.LOADED);
			} else {
				throw new Error('Average grade is undefined or null');
			}
		} catch {
			setAverageLoadingState(LoadingState.ERROR);
		}
	}

	// TODO: Just cache the spoWeights for the relevant study program
	const { data: spoWeights, isLoading: isSpoLoading } = useQuery({
		queryKey: ['spoWefights', packageInfo.version],
		queryFn: async () => await NeulandAPI.getSpoWeights(),
		staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		gcTime: 1000 * 60 * 60 * 24 * 14 // 2 weeks
	});

	const {
		data: grades,
		error,
		isLoading,
		isPaused,
		isSuccess,
		refetch,
		isError
	} = useQuery({
		queryKey: ['grades'],
		queryFn: loadGrades,
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		retry(_failureCount, error) {
			if (error instanceof NoSessionError) {
				router.replace('/login');
			}
			return false;
		}
	});

	const UNAVAILABLE_ERRORS = [
		'Student cannot be identified',
		'No grade data available'
	];

	const isUnavailableError = UNAVAILABLE_ERRORS.some((errMsg) =>
		error?.message.includes(errMsg)
	);

	const { data: personalData } = useQuery({
		queryKey: ['personalData'],
		queryFn: getPersonalData,
		staleTime: 1000 * 60 * 60 * 12, // 12 hours
		gcTime: 1000 * 60 * 60 * 24 * 60 // 60 days
	});

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
	useEffect(() => {
		if (personalData === undefined) return;
		const spoName = extractSpoName(personalData);
		void loadAverageGrade(spoName ?? undefined);
	}, [spoWeights, grades?.finished]);

	useEffect(() => {
		const handleAppStateChange = (nextAppState: AppStateStatus): void => {
			if (nextAppState === 'inactive' || nextAppState === 'background') {
				router.back();
			}
		};

		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		);

		return () => {
			subscription.remove();
		};
	}, []);

	const fuseOptions = {
		keys: ['titel'],
		threshold: 0.3,
		ignoreLocation: true
	};

	const filteredGrades = React.useMemo(() => {
		if (!grades) return null;
		if (localSearch === '') {
			return grades;
		}

		const finishedFuse = new Fuse(grades.finished, fuseOptions);
		const missingFuse = new Fuse(grades.missing, fuseOptions);

		return {
			finished: finishedFuse.search(localSearch).map((result) => result.item),
			missing: missingFuse.search(localSearch).map((result) => result.item)
		};
	}, [grades, localSearch]);

	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
			contentInsetAdjustmentBehavior="automatic"
			refreshControl={
				isSuccess ? (
					<RefreshControl
						refreshing={isRefetchingByUser}
						onRefresh={() => {
							void refetchByUser();
						}}
					/>
				) : undefined
			}
		>
			{isLoading && (
				<View style={styles.loadingContainer}>
					<LoadingIndicator />
				</View>
			)}
			{isError && (
				<View style={styles.loadingContainer}>
					<ErrorView
						title={
							isUnavailableError
								? t('grades.temporarilyUnavailable')
								: error.message
						}
						onRefresh={refetchByUser}
						refreshing={isRefetchingByUser}
						isCritical={!isUnavailableError}
					/>
				</View>
			)}
			{isPaused && !isSuccess && (
				<ErrorView
					title={networkError}
					onRefresh={refetchByUser}
					refreshing={isRefetchingByUser}
				/>
			)}
			{isSuccess && grades !== null && (
				<>
					{filteredGrades?.finished.length !== 0 && localSearch === '' && (
						<>
							<SectionView title={t('grades.average')}>
								<View style={styles.loadedContainer}>
									{averageLoadingState === LoadingState.LOADING && (
										<LoadingIndicator />
									)}
									{averageLoadingState === LoadingState.ERROR && (
										<Text style={styles.averageErrorText}>
											{t('grades.averageError')}
										</Text>
									)}
									{averageLoadingState === LoadingState.LOADED &&
										gradeAverage !== undefined &&
										gradeAverage !== null && (
											<View style={styles.averageContainer}>
												<Text style={styles.averageText}>
													{gradeAverage.resultMin !== gradeAverage.resultMax &&
														'~ '}
													{gradeAverage.result}
												</Text>

												<Text style={styles.averageNote}>
													{gradeAverage.resultMin === gradeAverage.resultMax
														? t('grades.exactAverage', {
																number: gradeAverage.entries.length
															})
														: t('grades.missingAverage', {
																min: gradeAverage.resultMin,
																max: gradeAverage.resultMax
															})}
												</Text>
											</View>
										)}
								</View>
							</SectionView>
							<SectionView title={t('grades.finished')}>
								<React.Fragment>
									{filteredGrades?.finished.map((grade, index) => (
										<React.Fragment key={index}>
											<GradesRow item={grade} />
											{index !== filteredGrades.finished.length - 1 && (
												<Divider iosPaddingLeft={16} />
											)}
										</React.Fragment>
									))}
								</React.Fragment>
							</SectionView>
						</>
					)}
					{filteredGrades?.missing.length !== 0 && (
						<SectionView title={t('grades.open')}>
							<React.Fragment>
								{filteredGrades?.missing.map((grade, index) => (
									<React.Fragment key={index}>
										<GradesRow item={grade} />
										{index !== filteredGrades.missing.length - 1 && (
											<Divider iosPaddingLeft={16} />
										)}
									</React.Fragment>
								))}
							</React.Fragment>
						</SectionView>
					)}
					<View style={styles.notesBox}>
						<Text style={styles.notesText}>{t('grades.footer')}</Text>
					</View>
				</>
			)}
		</ScrollView>
	);
}

const stylesheet = createStyleSheet((theme) => ({
	averageContainer: {
		alignItems: 'flex-start',
		justifyContent: 'center',
		marginHorizontal: theme.margins.page
	},
	averageErrorText: {
		color: theme.colors.text,
		fontSize: 15,
		textAlign: 'center'
	},
	averageNote: {
		color: theme.colors.labelColor,
		fontSize: 14,
		textAlign: 'left'
	},
	averageText: {
		color: theme.colors.text,
		fontSize: 25,
		fontWeight: '700',
		marginBottom: 5,
		textAlign: 'center'
	},
	contentContainer: {
		paddingBottom: 32
	},
	loadedContainer: {
		alignSelf: 'center',
		borderRadius: theme.radius.md,
		justifyContent: 'center',
		marginHorizontal: theme.margins.page,
		marginVertical: 16,
		minHeight: 70,
		width: '100%'
	},
	loadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 40
	},
	notesBox: {
		alignSelf: 'flex-start',
		paddingBottom: 32,
		paddingHorizontal: theme.margins.page,
		paddingTop: 16
	},
	notesText: {
		color: theme.colors.labelColor,
		fontSize: 12,
		fontWeight: 'normal',
		paddingTop: 8,
		textAlign: 'left'
	}
}));
