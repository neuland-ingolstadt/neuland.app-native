import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
	Linking,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
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
	const { t } = useTranslation('common')

	return (
		<View style={styles.itemContainer}>
			<Pressable
				style={({ pressed }) => [
					styles.itemPressable,
					{ opacity: pressed ? 0.85 : 1 }
				]}
				onPress={() => {
					router.push({
						pathname: '/events/organizer/[id]',
						params: { id: organizer.id.toString() }
					})
				}}
			>
				<View style={styles.itemHeaderRow}>
					<Text style={styles.itemTitle}>{organizer.name}</Text>
					{organizer.website != null && organizer.website !== '' && (
						<Text
							style={[styles.itemLink, { color: theme.colors.primary }]}
							onPress={() => {
								void Linking.openURL(organizer.website as string)
							}}
						>
							{t('pages.event.organizerDetails.clubWebsite')}
						</Text>
					)}
				</View>
				{organizer.location != null && organizer.location !== '' && (
					<Text style={styles.itemSubtitle}>{organizer.location}</Text>
				)}
				{organizer.descriptions.en != null ||
				organizer.descriptions.de != null ? (
					<Text style={styles.itemDescription} numberOfLines={2}>
						{organizer.descriptions.en ?? organizer.descriptions.de ?? ''}
					</Text>
				) : null}
			</Pressable>
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
		borderRadius: 16,
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		marginBottom: 12
	},
	itemPressable: {
		paddingHorizontal: 20,
		paddingVertical: 16
	},
	itemHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12
	},
	itemTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		flex: 1
	},
	itemSubtitle: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14,
		marginTop: 4
	},
	itemDescription: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		marginTop: 6
	},
	itemLink: {
		fontSize: 14,
		fontWeight: '600'
	}
}))
