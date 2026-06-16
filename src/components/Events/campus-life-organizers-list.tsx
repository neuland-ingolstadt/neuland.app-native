import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import RowEntry from '@/components/Universal/row-entry'
import { useRefreshByUser } from '@/hooks'
import type {
	CampusLifeOrganizer,
	CampusLifePublicOrganizerKind
} from '@/types/campus-life'
import { loadCampusLifeOrganizers, QUERY_KEYS } from '@/utils/events-utils'

type OrganizersPage = 'clEvents' | 'thiEvents'
type OrganizersSection = 'clubs' | 'departments'

interface CampusLifeOrganizersListProps {
	organizerKind: CampusLifePublicOrganizerKind
	page: OrganizersPage
	section: OrganizersSection
}

export default function CampusLifeOrganizersList({
	organizerKind,
	page,
	section
}: CampusLifeOrganizersListProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')
	const sectionPrefix = `pages.${page}.${section}` as const

	const organizersQuery = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_ORGANIZERS, organizerKind],
		queryFn: () => loadCampusLifeOrganizers(organizerKind),
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24
	})

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(
		organizersQuery.refetch
	)

	const emptyTitleKey =
		page === 'thiEvents'
			? 'pages.thiEvents.events.noEvents.title'
			: 'pages.clEvents.events.noEvents.title'

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
				<ErrorView title={t(emptyTitleKey)} />
			) : (
				<FlashList
					data={organizersQuery.data}
					keyExtractor={(item) => item.id.toString()}
					estimatedItemSize={64}
					renderItem={({ item }) => (
						<OrganizerListItem
							organizer={item}
							missingDescriptionKey={
								`${sectionPrefix}.missingDescription` as 'pages.clEvents.clubs.missingDescription'
							}
						/>
					)}
					contentContainerStyle={styles.listContent}
					ListFooterComponent={
						<View style={styles.footerContainer}>
							<Text style={styles.footerText}>
								{t(
									`${sectionPrefix}.footerInfo` as 'pages.clEvents.clubs.footerInfo'
								)}
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
	organizer,
	missingDescriptionKey
}: {
	organizer: CampusLifeOrganizer
	missingDescriptionKey:
		| 'pages.clEvents.clubs.missingDescription'
		| 'pages.thiEvents.departments.missingDescription'
}): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)

	return (
		<View style={styles.itemContainer}>
			<RowEntry
				title={organizer.name}
				backgroundColor={theme.colors.card}
				onPress={() => {
					router.push({
						pathname: '/events/organiser/[id]',
						params: { id: organizer.id.toString() }
					})
				}}
				// biome-ignore lint/complexity/noUselessFragments: no
				rightChildren={<></>}
				leftChildren={
					<OrganizerRowContent
						organizer={organizer}
						missingDescriptionKey={missingDescriptionKey}
					/>
				}
			/>
		</View>
	)
}

const OrganizerRowContent = ({
	organizer,
	missingDescriptionKey
}: {
	organizer: CampusLifeOrganizer
	missingDescriptionKey:
		| 'pages.clEvents.clubs.missingDescription'
		| 'pages.thiEvents.departments.missingDescription'
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
				{localizedDescription ?? t(missingDescriptionKey)}
			</Text>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
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
	footerContainer: {
		marginTop: 12
	},
	footerText: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 12
	}
}))
