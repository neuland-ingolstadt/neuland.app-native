import ErrorView from '@/components/Error/ErrorView';
import DetailsBody from '@/components/Timetable/DetailsBody';
import DetailsRow from '@/components/Timetable/DetailsRow';
import DetailsSymbol from '@/components/Timetable/DetailsSymbol';
import Separator from '@/components/Timetable/Separator';
import ShareCard from '@/components/Timetable/ShareCard';
import FormList from '@/components/Universal/FormList';
import PlatformIcon, { chevronIcon } from '@/components/Universal/Icon';
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton';
import useRouteParamsStore from '@/hooks/useRouteParamsStore';
import type { FormListSections, SectionGroup } from '@/types/components';
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils';
import { isValidRoom } from '@/utils/timetable-utils';
import { trackEvent } from '@aptabase/react-native';
import { HeaderTitle } from '@react-navigation/elements';
import { Stack, useFocusEffect, useNavigation, useRouter } from 'expo-router';
import moment from 'moment';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Share, Text, View } from 'react-native';
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import ViewShot, { captureRef } from 'react-native-view-shot';

export default function TimetableDetails(): React.JSX.Element {
	const router = useRouter();
	const navigation = useNavigation();
	const { styles, theme } = useStyles(stylesheet);
	const { t } = useTranslation('timetable');
	const shareRef = useRef<ViewShot>(null);
	const lecture = useRouteParamsStore((state) => state.selectedLecture);
	const ref = useAnimatedRef<Animated.ScrollView>();
	const scroll = useScrollViewOffset(ref);
	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(scroll.value, [0, 100], [30, 0], 'clamp')
				}
			]
		};
	});
	useFocusEffect(
		useCallback(() => {
			if (lecture === undefined || Platform.OS === 'web') {
				navigation.setOptions({
					headerRight: () => undefined
				});
			} else {
				navigation.setOptions({
					headerRight: () => <ShareHeaderButton onPress={shareEvent} />
				});
			}
		}, [])
	);

	if (lecture === undefined) {
		return <ErrorView title="Cannot display lecture" />;
	}

	const startDate = new Date(lecture.startDate);
	const endDate = new Date(lecture.endDate);

	const exam =
		lecture.exam != null
			? `${lecture.exam.split('-').slice(-1)[0].trim()[0].toUpperCase()}${lecture.exam.split('-').slice(-1)[0].trim().slice(1)}`
			: null;

	async function shareEvent(): Promise<void> {
		try {
			const uri = await captureRef(shareRef, {
				format: 'png',
				quality: 1
			});
			trackEvent('Share', {
				type: 'lecture'
			});

			await Share.share({
				url: uri
			});
		} catch (e) {
			console.log(e);
		}
	}

	interface HtmlItem {
		title: 'overview.goal' | 'overview.content' | 'overview.literature';
		html: string | null;
	}

	const createItem = (
		titleKey: HtmlItem['title'],
		html: HtmlItem['html']
	): SectionGroup | null => {
		if (html !== null) {
			return {
				title: t(titleKey),
				icon: chevronIcon,
				onPress: () => {
					router.navigate({
						pathname: '/webview',
						params: {
							title: t(titleKey),
							html
						}
					});
				}
			};
		}
		return null;
	};

	const items = [
		createItem('overview.goal', lecture.goal),
		createItem('overview.content', lecture.contents),
		createItem('overview.literature', lecture.literature)
	].filter(Boolean) as SectionGroup[];

	const detailsList: FormListSections[] = [
		{
			header: t('overview.title'),
			items
		},
		{
			header: t('details.title'),
			items: [
				...(exam != null
					? [
							{
								title: t('details.exam'),
								value: exam,
								layout: 'column' as const
							}
						]
					: []),
				{
					title: t('details.studyGroup'),
					value: lecture.studyGroup
				},
				{
					title: t('details.courseOfStudies'),
					value: lecture.course
				},
				{
					title: t('details.weeklySemesterHours'),
					value: lecture.sws
				}
			]
		}
	];

	return (
		<Animated.ScrollView ref={ref} contentContainerStyle={styles.page}>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View style={styles.headerTitle}>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={theme.colors.text}>
									{lecture.name}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>
			<View>
				<DetailsRow>
					<DetailsSymbol>
						<View style={styles.eventColorCircle} />
					</DetailsSymbol>
					<DetailsBody>
						<Text style={styles.eventName}>{lecture.name}</Text>
						{lecture.shortName.length > 0 ? (
							<Text style={styles.eventShortName}>{lecture.shortName}</Text>
						) : (
							<></>
						)}
					</DetailsBody>
				</DetailsRow>

				<Separator />

				<DetailsRow>
					<DetailsSymbol>
						<PlatformIcon
							style={styles.icon}
							ios={{
								name: 'clock',
								size: 21
							}}
							android={{
								name: 'calendar_month',
								size: 24
							}}
							web={{
								name: 'Clock',
								size: 24
							}}
						/>
					</DetailsSymbol>

					<DetailsBody>
						<View style={styles.dateRow}>
							<View>
								<Text style={styles.text1}>
									{formatFriendlyDate(startDate, {
										weekday: 'long',
										relative: false
									})}
								</Text>

								<View style={styles.detailsContainer}>
									<Text style={styles.text2}>
										{formatFriendlyTime(startDate)}
									</Text>

									<PlatformIcon
										style={styles.icon}
										ios={{
											name: 'chevron.forward',
											size: 12
										}}
										android={{
											name: 'chevron_right',
											size: 16
										}}
										web={{
											name: 'ChevronRight',
											size: 16
										}}
									/>

									<Text style={styles.text2}>
										{formatFriendlyTime(endDate)}
									</Text>

									<Text style={styles.text2Label}>
										{`(${moment(endDate).diff(
											moment(startDate),
											'minutes'
										)} ${t('time.minutes')})`}
									</Text>
								</View>
							</View>
							{}
						</View>
					</DetailsBody>
				</DetailsRow>

				<Separator />
				{lecture.rooms.length > 0 ? (
					<>
						<DetailsRow>
							<DetailsSymbol>
								<PlatformIcon
									ios={{
										name: 'mappin.and.ellipse',
										size: 21
									}}
									android={{
										name: 'place',
										size: 24
									}}
									web={{
										name: 'MapPin',
										size: 24
									}}
									style={styles.icon}
								/>
							</DetailsSymbol>

							<DetailsBody>
								<View style={styles.roomContainer}>
									{lecture.rooms.map((room, i) => {
										const isValid = isValidRoom(room);
										return (
											<React.Fragment key={i}>
												<Pressable
													onPress={() => {
														router.dismissTo({
															pathname: '/(tabs)/map',
															params: {
																room
															}
														});
													}}
													disabled={!isValid}
												>
													<Text style={styles.roomText(isValid)}>{room}</Text>
												</Pressable>
												{i < lecture.rooms.length - 1 && (
													<Text style={styles.text1}>{', '}</Text>
												)}
											</React.Fragment>
										);
									})}
								</View>
							</DetailsBody>
						</DetailsRow>
					</>
				) : null}

				{lecture.lecturer !== null ? (
					<>
						<Separator />
						<DetailsRow>
							<DetailsSymbol>
								<PlatformIcon
									ios={{
										name: 'person',
										size: 21
									}}
									android={{
										name: 'person',
										size: 24
									}}
									web={{
										name: 'User',
										size: 24
									}}
									style={styles.icon}
								/>
							</DetailsSymbol>

							<DetailsBody>
								<Text style={styles.text1}>{lecture.lecturer}</Text>
							</DetailsBody>
						</DetailsRow>
					</>
				) : null}
				<View style={styles.formListContainer}>
					<FormList sections={detailsList} />
				</View>
				<ViewShot ref={shareRef} style={styles.viewShot}>
					<ShareCard event={lecture} />
				</ViewShot>
			</View>
		</Animated.ScrollView>
	);
}

const stylesheet = createStyleSheet((theme) => ({
	dateRow: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingRight: 12,
		width: '100%'
	},
	detailsContainer: {
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'row',
		gap: 4
	},
	eventColorCircle: {
		aspectRatio: 1,
		backgroundColor: theme.colors.primary,
		borderRadius: 9999,
		width: 15
	},
	eventName: {
		color: theme.colors.text,
		fontSize: 24,
		fontWeight: 'bold'
	},
	eventShortName: {
		color: theme.colors.labelColor,
		fontSize: 14
	},
	formListContainer: {
		gap: 12,
		marginTop: 24
	},
	headerTitle: {
		marginBottom: Platform.OS === 'ios' ? -10 : 0,
		overflow: 'hidden',
		paddingRight: Platform.OS === 'ios' ? 0 : 50
	},
	icon: {
		color: theme.colors.labelColor
	},
	page: {
		display: 'flex',
		paddingBottom: theme.margins.bottomSafeArea,
		paddingHorizontal: theme.margins.page,
		paddingTop: theme.margins.page
	},
	roomContainer: {
		display: 'flex',
		flexDirection: 'row'
	},
	roomText: (isValid: boolean) => ({
		color: isValid ? theme.colors.primary : theme.colors.text,
		fontSize: 18
	}),
	text1: {
		color: theme.colors.text,
		fontSize: 18
	},
	text2: {
		color: theme.colors.text,
		fontSize: 14
	},
	text2Label: {
		color: theme.colors.labelColor,
		fontSize: 14
	},
	viewShot: {
		position: 'absolute',
		transform: [{ translateX: -1000 }],
		zIndex: -1
	}
}));
