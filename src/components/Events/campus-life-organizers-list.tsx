import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import RowEntry from '@/components/Universal/row-entry'
import { FlashList } from '@/components/Universal/styled'
import { useRefreshByUser } from '@/hooks'
import type {
	CampusLifeOrganizer,
	CampusLifePublicOrganizerKind
} from '@/types/campus-life'
import { campusLifeOrganiserParams } from '@/utils/campus-life-utils'
import { loadCampusLifeOrganizers, QUERY_KEYS } from '@/utils/events-utils'
import { toColor } from '@/utils/uniwind-utils'

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
	const { t } = useTranslation('common')
	const cardColor = toColor(useCSSVariable('--color-card'))
	const cardBackground = cardColor != null ? String(cardColor) : undefined
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
			? 'pages.thiEvents.departments.noOrganizers.title'
			: 'pages.clEvents.clubs.noOrganizers.title'

	return (
		<>
			{organizersQuery.isLoading ? (
				<View className="flex-1 items-center justify-center">
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
							organizerKind={organizerKind}
							cardColor={cardBackground}
							missingDescriptionKey={
								`${sectionPrefix}.missingDescription` as 'pages.clEvents.clubs.missingDescription'
							}
						/>
					)}
					contentContainerClassName="px-page py-3 pb-[122px]"
					ListFooterComponent={
						<View className="mt-3">
							<Text className="text-label-secondary text-xs">
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
	organizerKind,
	cardColor,
	missingDescriptionKey
}: {
	organizer: CampusLifeOrganizer
	organizerKind: CampusLifePublicOrganizerKind
	cardColor: string | undefined
	missingDescriptionKey:
		| 'pages.clEvents.clubs.missingDescription'
		| 'pages.thiEvents.departments.missingDescription'
}): React.JSX.Element => {
	return (
		<View className="mb-3">
			<RowEntry
				title={organizer.name}
				backgroundColor={cardColor != null ? String(cardColor) : undefined}
				onPress={() => {
					router.push({
						pathname: '/events/organiser/[id]',
						params: campusLifeOrganiserParams(organizer.id, organizerKind)
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
	const { t, i18n } = useTranslation('common')

	const localizedDescription = i18n.language.startsWith('de')
		? (organizer.descriptions.de ?? organizer.descriptions.en)
		: (organizer.descriptions.en ?? organizer.descriptions.de)

	return (
		<View className="gap-1.5">
			{organizer.location != null && organizer.location.trim() !== '' && (
				<Text className="text-label-secondary text-sm">
					{organizer.location}
				</Text>
			)}
			<Text className="text-label-secondary text-[13px]" numberOfLines={2}>
				{localizedDescription ?? t(missingDescriptionKey)}
			</Text>
		</View>
	)
}
