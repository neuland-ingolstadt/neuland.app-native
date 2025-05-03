import type { Calendar } from '@/types/data'
import { semesters } from '@/utils/calendar-utils'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CalendarRow } from '../Rows/CalendarRow'

export default function CalendarEventsPage({
	handleLinkPress
}: {
	handleLinkPress: () => void
}): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t, i18n } = useTranslation('common')

	// Get the current language for display
	const currentLang = i18n.language === 'de' ? 'de' : 'en'

	const renderCalendarItem = ({ item }: { item: Calendar }) => (
		<View style={styles.rowWrapper}>
			<CalendarRow event={item} />
		</View>
	)

	const renderSectionHeader = ({
		section: { title }
	}: {
		section: { title: string }
	}) => (
		<View style={styles.sectionHeaderContainer}>
			<Text style={styles.sectionHeaderText}>{title}</Text>
		</View>
	)

	const CalendarFooter = (): React.JSX.Element => {
		return (
			<View style={styles.footerContainer}>
				<Text style={styles.footerText1}>
					{t('pages.calendar.footer.part1')}
					<Text style={styles.footerText2} onPress={handleLinkPress}>
						{t('pages.calendar.footer.part2')}
					</Text>
					{t('pages.calendar.footer.part3')}
				</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			{semesters && semesters.length > 0 && (
				<SectionList
					sections={semesters.map((semester) => ({
						title: semester.name[currentLang],
						data: semester.events
					}))}
					renderItem={renderCalendarItem}
					renderSectionHeader={renderSectionHeader}
					keyExtractor={(item, index) => item.name[currentLang] + index}
					contentContainerStyle={styles.flashListContentContainer}
					showsVerticalScrollIndicator={false}
					scrollEventThrottle={16}
					stickySectionHeadersEnabled={true}
					ListFooterComponent={<CalendarFooter />}
				/>
			)}
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		width: '100%'
	},
	footerContainer: {
		marginVertical: 4,
		paddingBottom: theme.margins.bottomSafeArea
	},
	footerText1: {
		color: theme.colors.labelColor,
		fontSize: 12,
		fontWeight: 'normal',
		paddingBottom: 25,
		textAlign: 'justify'
	},
	footerText2: {
		color: theme.colors.text,
		textDecorationLine: 'underline'
	},
	rowWrapper: {
		marginBottom: 8
	},
	flashListContentContainer: {
		marginTop: -2,
		paddingHorizontal: theme.margins.page
	},
	sectionHeaderContainer: {
		backgroundColor: theme.colors.background,
		paddingVertical: 8,
		marginBottom: 4
	},
	sectionHeaderText: {
		color: theme.colors.text,
		fontSize: 19,
		fontWeight: '600'
	}
}))
