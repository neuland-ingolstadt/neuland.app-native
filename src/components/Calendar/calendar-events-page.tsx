import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, type SectionListData, Text, View } from 'react-native'
import type { Calendar } from '@/types/data'
import { semesters } from '@/utils/calendar-utils'
import { CalendarRow } from '../Rows/calendar-row'

type Section = {
	title: string
	data: Calendar[]
}

const ITEM_HEIGHT = 78

const renderCalendarItem = ({ item }: { item: Calendar }) => (
	<View className="mb-2">
		<CalendarRow event={item} />
	</View>
)

const renderSectionHeader = ({
	section
}: {
	section: SectionListData<Calendar, Section>
}) => (
	<View className="bg-background py-2 mb-1">
		<Text className="text-text text-[19px] font-semibold">{section.title}</Text>
	</View>
)

const getItemLayout = (
	_data: SectionListData<Calendar, Section>[] | null,
	index: number
) => ({
	length: ITEM_HEIGHT,
	offset: index * ITEM_HEIGHT,
	index
})

export default function CalendarEventsPage({
	handleLinkPress,
	selectedEventId
}: {
	handleLinkPress: () => void
	selectedEventId?: string
}): React.JSX.Element {
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

	const CalendarFooter = (): React.JSX.Element => {
		return (
			<View className="my-1 pb-bottom-safe">
				<Text className="text-label text-xs font-normal pb-[25px] text-justify">
					{t('pages.calendar.footer.part1')}
					<Text className="text-text font-semibold" onPress={handleLinkPress}>
						{t('pages.calendar.footer.part2')}
					</Text>
					{t('pages.calendar.footer.part3')}
				</Text>
			</View>
		)
	}

	return (
		<View className="flex-1 w-full">
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
					contentContainerClassName="-mt-0.5 px-page"
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
