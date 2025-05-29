import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, type SectionListData, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { Calendar } from '@/types/data'
import { semesters } from '@/utils/calendar-utils'
import { CalendarRow } from '../Rows/CalendarRow'

type Section = {
	title: string
	data: Calendar[]
}

const ITEM_HEIGHT = 78

export default function CalendarEventsPage({
	handleLinkPress,
	selectedEventId
}: {
	handleLinkPress: () => void
	selectedEventId?: string
}): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t, i18n } = useTranslation('common')
	const sectionListRef = useRef<SectionList<Calendar, Section>>(null)
	const [isReady, setIsReady] = useState(false)
	const currentLang = i18n.language === 'de' ? 'de' : 'en'

	const findEventPosition = () => {
		if (!selectedEventId) return null

		for (
			let sectionIndex = 0;
			sectionIndex < semesters.length;
			sectionIndex++
		) {
			const eventIndex = semesters[sectionIndex].events.findIndex(
				(event) => event.id === selectedEventId
			)
			if (eventIndex !== -1) {
				return { sectionIndex, itemIndex: eventIndex }
			}
		}
		return null
	}

	useEffect(() => {
		if (selectedEventId && isReady) {
			const position = findEventPosition()
			if (position) {
				sectionListRef.current?.scrollToLocation({
					animated: true,
					sectionIndex: position.sectionIndex,
					itemIndex: position.itemIndex,
					viewOffset: 100
				})
			}
		}
	}, [selectedEventId, isReady])

	const renderCalendarItem = ({ item }: { item: Calendar }) => (
		<View style={styles.rowWrapper}>
			<CalendarRow event={item} />
		</View>
	)

	const renderSectionHeader = ({
		section
	}: {
		section: SectionListData<Calendar, Section>
	}) => (
		<View style={styles.sectionHeaderContainer}>
			<Text style={styles.sectionHeaderText}>{section.title}</Text>
		</View>
	)

	// biome-ignore lint/nursery/noNestedComponentDefinitions: not a problem here
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

	// Simplified getItemLayout calculation
	const getItemLayout = (
		_data: SectionListData<Calendar, Section>[] | null,
		index: number
	) => {
		return {
			length: ITEM_HEIGHT,
			offset: index * ITEM_HEIGHT,
			index
		}
	}

	return (
		<View style={styles.container}>
			{semesters && semesters.length > 0 && (
				<SectionList<Calendar, Section>
					ref={sectionListRef}
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
					getItemLayout={getItemLayout}
					onLayout={() => setIsReady(true)}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={5}
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
