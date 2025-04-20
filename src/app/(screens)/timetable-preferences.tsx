import MultiSectionRadio, {
	type FoodLanguageElement
} from '@/components/Food/FoodLanguageSection'
import TimetablePreview from '@/components/Timetable/TimetablePreview'
import MultiSectionPicker from '@/components/Universal/MultiSectionPicker'
import SectionView from '@/components/Universal/SectionsView'
import SingleSectionPicker from '@/components/Universal/SingleSectionPicker'
import { TimetableMode, usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function TimetablePreferences(): React.JSX.Element {
	const { t } = useTranslation(['navigation', 'timetable'])
	const { styles } = useStyles(stylesheet)

	const timetableMode = usePreferencesStore((state) => state.timetableMode)
	const setTimetableMode = usePreferencesStore(
		(state) => state.setTimetableMode
	)
	const showCalendarEvents = usePreferencesStore(
		(state) => state.showCalendarEvents
	)
	const setShowCalendarEvents = usePreferencesStore(
		(state) => state.setShowCalendarEvents
	)
	const showExams = usePreferencesStore((state) => state.showExams)
	const setShowExams = usePreferencesStore((state) => state.setShowExams)

	// Create timeline view mode elements for radio selection
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

	// Helper function to set timetable mode for the list view option
	const toggleListMode = (isSelected: boolean) => {
		if (isSelected) {
			setTimetableMode(TimetableMode.List)
		}
	}

	// Helper function to handle timeline mode changes
	const setTimelineMode = (mode: string) => {
		setTimetableMode(mode as TimetableMode)
	}

	// Create additional content elements for MultiSectionPicker
	const additionalContentElements = [
		{
			key: 'showCalendarEvents',
			title: t('preferences.showCalendarEvents', { ns: 'timetable' }),
			disabled: timetableMode === TimetableMode.List
		},
		{
			key: 'showExams',
			title: t('preferences.showExams', { ns: 'timetable' })
		}
	]

	// Generate selected items array for MultiSectionPicker
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
						state={false}
					/>
				</SectionView>

				<SectionView>
					<MultiSectionRadio
						elements={timelineModeElements}
						selectedItem={timetableMode}
						action={setTimelineMode}
					/>
				</SectionView>

				<SectionView
					title={t('timetable:preferences.additionalContent')}
					footer={
						timetableMode === TimetableMode.List
							? t('timetable:preferences.calendarEventsListModeNote')
							: '' // to preserve the space
					}
				>
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
