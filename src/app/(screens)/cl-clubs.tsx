import { useQuery } from '@tanstack/react-query'
import { useNavigation } from 'expo-router'
import type React from 'react'
import { startTransition, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/ErrorView'
import PlatformIcon from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import MultiSectionPicker from '@/components/Universal/MultiSectionPicker'
import SectionView from '@/components/Universal/SectionsView'
import { useClubsStore } from '@/hooks/useClubsStore'
import { networkError } from '@/utils/api-utils'
import { loadCampusLifeClubs, QUERY_KEYS } from '@/utils/events-utils'

export default function ClClubs(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['navigation', 'common'])
	const navigation = useNavigation()

	useLayoutEffect(() => {
		navigation.setOptions({ title: t('navigation.clubs') })
	}, [navigation, t])

	const { data, isLoading, isError, isPaused, isSuccess, refetch } = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_CLUBS],
		queryFn: loadCampusLifeClubs,
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24
	})

	const followedClubs = useClubsStore((state) => state.followedClubs)
	const toggleClub = useClubsStore((state) => state.toggleClub)

	if (isLoading) {
		return (
			<View style={styles.centerContainer}>
				<LoadingIndicator />
			</View>
		)
	}

	if (isError) {
		return (
			<ErrorView
				title={t('common:error.title')}
				onButtonPress={() => void refetch()}
			/>
		)
	}

	if (isPaused && !isSuccess) {
		return <ErrorView title={networkError} />
	}

	const elements = (data ?? []).map((club) => ({
		key: club.name,
		title: club.name
	}))

	const handleToggle = (name: string) => {
		startTransition(() => {
			toggleClub(name)
		})
	}

	return (
		<ScrollView>
			<View style={styles.container}>
				<View style={styles.infoContainer}>
					<Text style={styles.descriptionText}>
						{t('common:pages.clEvents.clubs.description')}
					</Text>
					<View style={styles.benefitsContainer}>
						<View style={styles.benefitRow}>
							<PlatformIcon
								ios={{ name: 'star.fill', size: 16 }}
								android={{ name: 'star', size: 20 }}
								web={{ name: 'Star', size: 16 }}
								style={styles.benefitIcon}
							/>
							<Text style={styles.benefitText}>
								{t('common:pages.clEvents.clubs.followInfo')}
							</Text>
						</View>
						<View style={styles.benefitRow}>
							<PlatformIcon
								ios={{ name: 'calendar', size: 16 }}
								android={{ name: 'calendar_today', size: 20 }}
								web={{ name: 'Calendar', size: 16 }}
								style={styles.benefitIcon}
							/>
							<Text style={styles.benefitText}>
								{t('common:pages.clEvents.clubs.calendarInfo')}
							</Text>
						</View>
						<View style={styles.benefitRow}>
							<PlatformIcon
								ios={{ name: 'sparkles', size: 16 }}
								android={{ name: 'auto_awesome', size: 20 }}
								web={{ name: 'Sparkles', size: 16 }}
								style={styles.benefitIcon}
							/>
							<Text style={styles.benefitText}>
								{t('common:pages.clEvents.clubs.priorityInfo')}
							</Text>
						</View>
					</View>
				</View>
				<SectionView title={t('navigation.clubs')}>
					<MultiSectionPicker
						elements={elements}
						selectedItems={followedClubs}
						action={handleToggle}
					/>
				</SectionView>
			</View>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: { flex: 1 },
	centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	infoContainer: {
		marginHorizontal: theme.margins.page,
		marginTop: 16,
		marginBottom: 8,
		paddingHorizontal: 16,
		paddingVertical: 16,
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		borderColor: theme.colors.border,
		borderWidth: 1
	},
	descriptionText: {
		color: theme.colors.text,
		fontSize: 16,
		lineHeight: 22,
		marginBottom: 16,
		fontWeight: '500'
	},
	benefitsContainer: {
		gap: 8
	},
	benefitRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8
	},
	benefitIcon: {
		color: theme.colors.primary
	},
	benefitText: {
		color: theme.colors.labelColor,
		fontSize: 14,
		lineHeight: 20,
		flex: 1
	}
}))
