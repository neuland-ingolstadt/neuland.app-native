import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { RefreshControl, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import RowEntry from '@/components/Universal/row-entry'
import { useRefreshByUser } from '@/hooks'
import type { CampusLifeOrganizer } from '@/types/campus-life'
import { loadCampusLifeOrganizers, QUERY_KEYS } from '@/utils/events-utils'

export default function ClClubsScreen(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const organizersQuery = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_ORGANIZERS],
		queryFn: loadCampusLifeOrganizers,
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24
	})

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(
		organizersQuery.refetch
	)

	return (
		<>
			{organizersQuery.isLoading ? (
				<View style={styles.centered}>
					<LoadingIndicator />
				</View>
			) : organizersQuery.isError ? (
				<ErrorView
					title={organizersQuery.error?.message ?? t('error.title')}
					onButtonPress={() => {
						void refetchByUser()
					}}
				/>
			) : organizersQuery.data == null || organizersQuery.data.length === 0 ? (
				<ErrorView title={t('pages.clEvents.events.noEvents.title')} />
			) : (
				<FlashList
					data={organizersQuery.data}
					keyExtractor={(item) => item.id.toString()}
					estimatedItemSize={64}
					renderItem={({ item }) => <OrganizerListItem organizer={item} />}
					contentContainerStyle={styles.listContent}
					ListFooterComponent={
						<View style={styles.footerContainer}>
							<Text style={styles.footerText}>
								{t('pages.clEvents.clubs.footerInfo')}
							</Text>
						</View>
					}
					refreshControl={
						<RefreshControl
							refreshing={isRefetchingByUser}
							onRefresh={() => {
								void refetchByUser()
							}}
						/>
					}
				/>
			)}
		</>
	)
}

const OrganizerListItem = ({
	organizer
}: {
	organizer: CampusLifeOrganizer
}): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)

	return (
		<View style={styles.itemContainer}>
			<RowEntry
				title={organizer.name}
				backgroundColor={theme.colors.card}
				onPress={() => {
					router.push({
						pathname: '/events/club/[id]',
						params: { id: organizer.id.toString() }
					})
				}}
				// biome-ignore lint/complexity/noUselessFragments: no
				rightChildren={<></>}
				leftChildren={<OrganizerRowContent organizer={organizer} />}
			/>
		</View>
	)
}

const OrganizerRowContent = ({
	organizer
}: {
	organizer: CampusLifeOrganizer
}): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	const { t, i18n } = useTranslation('common')

	const localizedDescription = i18n.language.startsWith('de')
		? (organizer.descriptions.de ?? organizer.descriptions.en)
		: (organizer.descriptions.en ?? organizer.descriptions.de)

	return (
		<View style={styles.rowContent}>
			{organizer.location != null && organizer.location.trim() !== '' && (
				<Text style={styles.itemSubtitle}>{organizer.location}</Text>
			)}
			<Text style={styles.itemDescription} numberOfLines={2}>
				{localizedDescription ?? t('pages.clEvents.clubs.missingDescription')}
			</Text>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		paddingHorizontal: theme.margins.page
	},
	centered: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	listContent: {
		paddingHorizontal: theme.margins.page,
		paddingVertical: theme.margins.page,
		paddingBottom: theme.margins.bottomSafeArea + 32
	},
	itemContainer: {
		marginBottom: 12
	},
	rowContent: {
		gap: 6
	},
	itemSubtitle: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14
	},
	itemDescription: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13
	},
	itemLink: {
		fontSize: 14,
		fontWeight: '600'
	},
	footerContainer: {
		marginTop: 12
	},
	footerText: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 12
	}
}))
