import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PulsingDot from '@/components/Universal/pulsing-dot'
import type { TodayStats } from '@/utils/up-next-utils'

interface TodayStatsRowProps {
	stats: TodayStats
	nextEvent: React.ReactNode
}

export default function TodayStatsRow({
	stats,
	nextEvent
}: TodayStatsRowProps): React.JSX.Element | null {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('navigation')

	if (stats.total === 0) {
		return null
	}

	const statsText =
		stats.remaining > 0
			? t(
					stats.remaining === 1
						? 'cards.timetable.lecturesRemaining_one'
						: 'cards.timetable.lecturesRemaining_plural',
					{ count: stats.remaining }
				)
			: t('cards.timetable.noMoreLectures')

	return (
		<View style={styles.statsContainer}>
			{nextEvent}
			<Pressable
				style={styles.statsRow}
				onPress={() => router.navigate('/dots')}
				hitSlop={10}
			>
				<View style={styles.progressDots}>
					{Array.from({ length: stats.total }).map((_, index) =>
						index < stats.completed ? (
							<View key={index} style={[styles.dot, styles.dotCompleted]} />
						) : index < stats.completed + stats.ongoing ? (
							<PulsingDot key={index} style={[styles.dot, styles.dotOngoing]} />
						) : (
							<View key={index} style={[styles.dot, styles.dotRemaining]} />
						)
					)}
				</View>
				<Text style={styles.statsText} numberOfLines={1}>
					{statsText}
				</Text>
			</Pressable>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	statsContainer: {
		marginTop: 4,
		flexDirection: 'column',
		gap: 8
	},
	statsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8
	},
	statsText: {
		color: theme.colors.labelColor,
		fontSize: 13
	},
	progressDots: {
		flexDirection: 'row',
		gap: 6,
		alignItems: 'center',
		flexWrap: 'wrap'
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4
	},
	dotCompleted: {
		backgroundColor: theme.colors.completedDot
	},
	dotOngoing: {
		backgroundColor: theme.colors.success
	},
	dotRemaining: {
		backgroundColor: theme.colors.soonDot,
		borderColor: theme.colors.labelColor,
		borderWidth: StyleSheet.hairlineWidth
	}
}))
