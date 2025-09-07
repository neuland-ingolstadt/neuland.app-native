import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import MultiSectionRadio, {
	type FoodLanguageElement
} from '@/components/Food/food-language-section'
import TimetablePreview from '@/components/Timetable/timetable-preview'
import MultiSectionPicker from '@/components/Universal/multi-section-picker'
import SectionView from '@/components/Universal/sections-view'
import SingleSectionPicker from '@/components/Universal/single-section-picker'
import { TimetableMode, useTimetableStore } from '@/hooks/useTimetableStore'

export default function TimetablePreferences(): React.JSX.Element {
	const { t } = useTranslation(['navigation', 'timetable'])
	const { styles } = useStyles(stylesheet)

	const timetableMode = useTimetableStore((state) => state.timetableMode)
	const setTimetableMode = useTimetableStore((state) => state.setTimetableMode)
	const showCalendarEvents = useTimetableStore(
		(state) => state.showCalendarEvents
	)
	const setShowCalendarEvents = useTimetableStore(
		(state) => state.setShowCalendarEvents
	)
	const showExams = useTimetableStore((state) => state.showExams)
	const setShowExams = useTimetableStore((state) => state.setShowExams)

	const timelineModeElements: FoodLanguageElement[] = [
		{
			key: TimetableMode.Timeline1,
			title: t('viewModes.oneDay', { ns: 'timetable' })
		},
		{
			key: TimetableMode.Timeline3,
			title: t('viewModes.threeDays', { ns: 'timetable' })
		},
		{
			key: TimetableMode.Timeline5,
			title: t('viewModes.fiveDays', { ns: 'timetable' })
		},
		{
			key: TimetableMode.Timeline7,
			title: t('viewModes.sevenDays', { ns: 'timetable' })
		}
	]

	const toggleListMode = (isSelected: boolean) => {
		if (isSelected) {
			setTimetableMode(TimetableMode.List)
		} else if (timetableMode === TimetableMode.List) {
			setTimetableMode(TimetableMode.Timeline3)
		}
	}

	const setTimelineMode = (mode: string) => {
		setTimetableMode(mode as TimetableMode)
	}

	const additionalContentElements = [
		{
			key: 'showCalendarEvents',
			title: t('preferences.showCalendarEvents', { ns: 'timetable' })
		},
		{
			key: 'showExams',
			title: t('preferences.showExams', { ns: 'timetable' })
		}
	]

	const selectedAdditionalContent = []
	if (showCalendarEvents) selectedAdditionalContent.push('showCalendarEvents')
	if (showExams) selectedAdditionalContent.push('showExams')

	// Handle toggling additional content options
	const toggleAdditionalContent = (key: string) => {
		if (key === 'showCalendarEvents') {
			setShowCalendarEvents(!showCalendarEvents)
		} else if (key === 'showExams') {
			setShowExams(!showExams)
		}
	}

	return (
		<ScrollView>
			<View style={styles.container}>
				<SectionView title={t('timetable:preferences.title')}>
					<SingleSectionPicker
						title={t('timetable:viewModes.list')}
						selectedItem={timetableMode === TimetableMode.List}
						action={toggleListMode}
					/>
				</SectionView>

				<SectionView>
					<MultiSectionRadio
						elements={timelineModeElements}
						selectedItem={timetableMode}
						action={setTimelineMode}
					/>
				</SectionView>

				<SectionView title={t('timetable:preferences.additionalContent')}>
					<MultiSectionPicker
						elements={additionalContentElements}
						selectedItems={selectedAdditionalContent}
						action={toggleAdditionalContent}
					/>
				</SectionView>

				<View style={styles.previewContainerWrapper}>
					<View style={styles.previewContainer}>
						<TimetablePreview
							mode={timetableMode}
							showCalendarEvents={showCalendarEvents}
							showExams={showExams}
						/>
					</View>
				</View>
			</View>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: { flex: 1 },
	previewContainerWrapper: {
		paddingHorizontal: theme.margins.page,
		marginTop: 40,
		width: '100%',
		alignItems: 'center'
	},
	previewContainer: {
		width: '100%',
		maxWidth: 600
	}
}))
