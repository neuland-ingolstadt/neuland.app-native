import DateTimePicker from '@react-native-community/datetimepicker'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Picker } from 'swiftui-react-native'
import { RoomSearchResults } from '@/components/Map/room-search-results'
import { roomSearchStylesheet } from '@/components/Map/room-search-styles'
import Divider from '@/components/Universal/divider'
import PlatformIcon from '@/components/Universal/icon'
import { useIsFeatureEnabled } from '@/hooks'
import { usePickerBinding } from '@/hooks/usePickerBinding.ios'
import { useRoomSearch } from '@/hooks/useRoomSearch'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import { getAllBuildings, ROOM_SEARCH_DURATIONS } from '@/utils/map-utils'

const maximumSearchDate = new Date(
	new Date().setDate(new Date().getDate() + 90)
)

export default function AdvancedSearch(): React.JSX.Element {
	const { styles, theme } = useStyles(roomSearchStylesheet)
	const { styles: iosStyles } = useStyles(iosStylesheet)
	const { t } = useTranslation('common')
	const mapOverlayV27 = useIsFeatureEnabled(FeatureFlagKeys.mapOverlayV27)
	const allBuildings = getAllBuildings(mapOverlayV27)
	const headerPadding = useTransparentHeaderPadding() + 10
	const roomSearch = useRoomSearch()

	const building = usePickerBinding(roomSearch.building, roomSearch.setBuilding)
	const duration = usePickerBinding(roomSearch.duration, roomSearch.setDuration)

	return (
		<ScrollView style={[styles.scrollView, { paddingTop: headerPadding }]}>
			<View>
				<Text style={styles.sectionHeader}>
					{t('pages.rooms.options.title')}
				</Text>
				<View style={styles.section}>
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.date')}
						</Text>

						<DateTimePicker
							value={roomSearch.searchDateTime}
							mode="date"
							accentColor={theme.colors.primary}
							locale="de-DE"
							onChange={(_event, selectedDate) => {
								roomSearch.setDate(formatISODate(selectedDate))
							}}
							minimumDate={new Date()}
							maximumDate={maximumSearchDate}
						/>
					</View>

					<Divider paddingLeft={16} />
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.time')}
						</Text>

						<DateTimePicker
							value={roomSearch.searchDateTime}
							mode="time"
							is24Hour={true}
							accentColor={theme.colors.primary}
							locale="de-DE"
							minuteInterval={5}
							onChange={(_event, selectedDate) => {
								roomSearch.setTime(formatISOTime(selectedDate))
							}}
						/>
					</View>
					<Divider paddingLeft={16} />
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.duration')}
						</Text>

						<Picker
							selection={duration}
							pickerStyle="menu"
							tint={theme.colors.primary}
							offset={{ x: 15, y: 0 }}
						>
							{ROOM_SEARCH_DURATIONS.map((option) => (
								<Text key={option}>{option}</Text>
							))}
						</Picker>
					</View>
					<Divider paddingLeft={16} />
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.building')}
						</Text>

						<Picker
							selection={building}
							pickerStyle="menu"
							tint={theme.colors.primary}
							offset={{ x: 20, y: 0 }}
						>
							{allBuildings.map((option) => (
								<Text key={option}>{option}</Text>
							))}
						</Picker>
					</View>
				</View>
				{roomSearch.wasModified && roomSearch.isDateAndTimeEqualToStart && (
					<View style={styles.section}>
						<View style={iosStyles.adjustContainer}>
							<PlatformIcon
								ios={{
									name: 'sparkles',
									size: 18
								}}
								android={{
									name: 'update',
									size: 20
								}}
								web={{
									name: 'Sparkles',
									size: 20
								}}
							/>
							<Text style={iosStyles.adjustedTitle}>
								{t('pages.rooms.modified.title')}
							</Text>
						</View>

						<Text style={iosStyles.adjustText}>
							{t('pages.rooms.modified.description', {
								date: roomSearch.date,
								time: roomSearch.time
							})}
						</Text>
					</View>
				)}
				<RoomSearchResults
					rooms={roomSearch.rooms}
					filterError={roomSearch.filterError}
					isLoading={roomSearch.isLoading}
					isError={roomSearch.isError}
					isPaused={roomSearch.isPaused}
					error={roomSearch.error}
					refetchByUser={roomSearch.refetchByUser}
				/>
			</View>
		</ScrollView>
	)
}

const iosStylesheet = createStyleSheet((theme) => ({
	adjustContainer: {
		alignContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		gap: 5,
		paddingHorizontal: 10,
		paddingTop: 10
	},
	adjustText: {
		color: theme.colors.text,
		fontSize: 15,
		padding: 10
	},
	adjustedTitle: {
		color: theme.colors.primary,
		fontSize: 16,
		fontWeight: '500',
		marginLeft: 5
	}
}))
