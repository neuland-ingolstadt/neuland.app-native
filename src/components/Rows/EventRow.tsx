import type { RelativePathString } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { CampusLifeEventFieldsFragment } from '@/__generated__/gql/graphql'
import type { LanguageKey } from '@/localization/i18n'
import {
	formatFriendlyDateTimeRange,
	formatFriendlyRelativeTime
} from '@/utils/date-utils'
import RowEntry from '../Universal/RowEntry'

const CLEventRow = ({
	event
}: {
	event: CampusLifeEventFieldsFragment
}): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	const { t, i18n } = useTranslation('common')
	let begin = null
	if (event.startDateTime != null) {
		begin = new Date(event.startDateTime)
	}
	const end = event.endDateTime != null ? new Date(event.endDateTime) : null

	// Determine if event is active (ongoing)
	const isActive =
		begin != null && begin < new Date() && end != null && end > new Date()

	return (
		<RowEntry
			href={`/events/cl/${event.id}` as RelativePathString}
			title={event.titles[i18n.language as LanguageKey] ?? ''}
			leftChildren={
				<View style={styles.leftContainer}>
					<Text style={styles.leftText1} numberOfLines={2}>
						{event.host.name}
					</Text>
					<Text style={styles.leftText2} numberOfLines={2}>
						{formatFriendlyDateTimeRange(begin, end)}
					</Text>
				</View>
			}
			rightChildren={
				<View style={styles.rightContainer}>
					{isActive && <View style={styles.activeDot} />}
					<Text style={[styles.rightText, isActive && styles.activeText]}>
						{begin != null &&
							(end != null && begin < new Date()
								? `${t('dates.ends')} ${formatFriendlyRelativeTime(end)}`
								: formatFriendlyRelativeTime(begin))}
					</Text>
				</View>
			}
		/>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	leftText1: {
		color: theme.colors.labelColor,
		fontSize: 14,
		fontWeight: '500',
		marginBottom: 4
	},
	leftText2: {
		color: theme.colors.labelColor,
		fontSize: 13
	},
	leftContainer: {
		marginTop: 2
	},
	rightContainer: {
		justifyContent: 'flex-end',
		padding: theme.margins.rowPadding,
		alignItems: 'flex-end',
		flexDirection: 'row',
		gap: 6
	},
	rightText: {
		color: theme.colors.labelColor,
		fontSize: 14,
		fontWeight: '400'
	},
	activeText: {
		color: theme.colors.primary,
		fontWeight: '500'
	},
	activeDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: theme.colors.primary,
		marginBottom: 3
	}
}))

export default CLEventRow
