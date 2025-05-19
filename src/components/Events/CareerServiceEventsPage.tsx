import type { CareerServiceEventFieldsFragment } from '@/__generated__/gql/graphql'
import ErrorView from '@/components/Error/ErrorView'
import { formatFriendlyDate } from '@/utils/date-utils'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import type React from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const MemoizedEventRow = memo(CareerServiceEventRow)

function CareerServiceEventRow({
	event
}: {
	event: CareerServiceEventFieldsFragment
}): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const handlePress = () => {
		router.navigate({
			pathname: '/events/career/[id]',
			params: { id: event.id }
		})
	}

	return (
		<Pressable style={styles.eventItem} onPress={handlePress}>
			<View style={styles.eventContent}>
				<Text style={styles.eventTitle}>{event.title}</Text>
				<Text style={styles.eventDate}>{formatFriendlyDate(event.date)}</Text>
				<View style={styles.slotsContainer}>
					{event.unlimitedSlots ? (
						<Text style={styles.slotsText}>
							{t('pages.events.registration.unlimitedSlots')}
						</Text>
					) : (
						<Text style={styles.slotsText}>
							{t('pages.events.registration.availableSlots', {
								available: event.availableSlots,
								total: event.totalSlots
							})}
						</Text>
					)}
					{event.waitingList && event.waitingList > 0 && (
						<Text style={styles.waitingListText}>
							{t('pages.events.registration.waitingList', {
								current: event.waitingList,
								max: event.maxWaitingList
							})}
						</Text>
					)}
				</View>
			</View>
		</Pressable>
	)
}

export default function CareerServiceEventsPage({
	events
}: {
	events: CareerServiceEventFieldsFragment[]
}): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const renderItem = ({ item }: { item: CareerServiceEventFieldsFragment }) => (
		<View style={styles.rowWrapper}>
			<MemoizedEventRow event={item} />
		</View>
	)

	return (
		<View style={styles.container}>
			{events.length > 0 ? (
				<FlashList
					data={events}
					renderItem={renderItem}
					estimatedItemSize={70}
					contentContainerStyle={styles.flashListContainer}
					showsVerticalScrollIndicator={false}
					scrollEventThrottle={16}
					disableAutoLayout
					ListHeaderComponent={
						<Text style={styles.sectionHeaderText}>
							{t('pages.events.careerService.title')}
						</Text>
					}
				/>
			) : (
				<ErrorView
					title={t('error.noData')}
					icon={{
						ios: 'calendar.badge.clock',
						android: 'calendar_clock',
						web: 'CalendarClock'
					}}
					isCritical={false}
				/>
			)}
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		paddingHorizontal: theme.margins.page
	},
	contentContainer: {
		backgroundColor: 'transparent',
		flex: 1,
		width: '100%'
	},
	flashListContainer: {
		paddingBottom: theme.margins.bottomSafeArea
	},
	rowWrapper: {
		marginBottom: 8
	},
	eventItem: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		padding: theme.margins.card,
		width: '100%'
	},
	eventContent: {
		gap: 4
	},
	eventTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600'
	},
	eventDate: {
		color: theme.colors.labelColor,
		fontSize: 14
	},
	slotsContainer: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 4
	},
	slotsText: {
		color: theme.colors.labelColor,
		fontSize: 14
	},
	waitingListText: {
		color: theme.colors.warning,
		fontSize: 14
	},
	sectionHeaderText: {
		color: theme.colors.text,
		fontSize: 19,
		fontWeight: '600',
		paddingBottom: 8
	}
}))
