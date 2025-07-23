import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import type React from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { StudentCounsellingEventFieldsFragment } from '@/__generated__/gql/graphql'
import { formatFriendlyDate } from '@/utils/date-utils'
import { EmptyEventsAnimation } from './empty-events-animation'

const MemoizedEventRow = memo(StudentCounsellingEventRow)

function StudentCounsellingEventRow({
	event
}: {
	event: StudentCounsellingEventFieldsFragment
}): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const handlePress = () => {
		router.navigate({
			pathname: '/events/counselling/[id]',
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
					) : typeof event.availableSlots === 'number' &&
						event.availableSlots > 0 ? (
						<Text style={styles.slotsText}>
							{t('pages.events.registration.availableSlots', {
								available: event.availableSlots,
								total: event.totalSlots
							})}
						</Text>
					) : event.waitingList && event.waitingList > 0 ? (
						<Text
							style={[
								styles.waitingListText,
								event.waitingList >= (event.maxWaitingList ?? 0) && {
									color: theme.colors.notification
								}
							]}
						>
							{t('pages.events.registration.waitingList.row', {
								current: event.waitingList,
								max: event.maxWaitingList
							})}
						</Text>
					) : (
						<Text
							style={[
								styles.waitingListText,
								{ color: theme.colors.notification }
							]}
						>
							{t('pages.events.registration.fullyBooked')}
						</Text>
					)}
				</View>
			</View>
		</Pressable>
	)
}

export default function StudentCounsellingEventsPage({
	events
}: {
	events: StudentCounsellingEventFieldsFragment[]
}): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const renderItem = ({
		item
	}: {
		item: StudentCounsellingEventFieldsFragment
	}) => (
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
							{t('pages.events.studentCounselling.title')}
						</Text>
					}
				/>
			) : (
				<EmptyEventsAnimation
					title={t('pages.studentCounselling.noEvents.title')}
					subtitle={t('pages.studentCounselling.noEvents.subtitle')}
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
