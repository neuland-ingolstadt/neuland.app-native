import { useQuery } from '@tanstack/react-query'
import { useNavigation } from 'expo-router'
import type React from 'react'
import { startTransition, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/ErrorView'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import MultiSectionPicker from '@/components/Universal/MultiSectionPicker'
import SectionView from '@/components/Universal/SectionsView'
import { useClubsStore } from '@/hooks/useClubsStore'
import { networkError } from '@/utils/api-utils'
import { loadCampusLifeClubs, QUERY_KEYS } from '@/utils/events-utils'

export default function ClClubs(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')
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
				title={t('error.title')}
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

const stylesheet = createStyleSheet((_theme) => ({
	container: { flex: 1 },
	centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
}))
