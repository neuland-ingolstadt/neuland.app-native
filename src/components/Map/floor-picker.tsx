import * as Haptics from 'expo-haptics'
import type React from 'react'
import { memo, use } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/Icon'
import { MapContext } from '@/contexts/map'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

interface FloorPickerProps {
	floors: string[]
	showAllFloors: boolean
	toggleShowAllFloors: () => void
	setCameraTriggerKey: React.Dispatch<React.SetStateAction<number>>
}

const FloorPicker = ({
	floors,
	showAllFloors,
	toggleShowAllFloors,
	setCameraTriggerKey
}: FloorPickerProps): React.JSX.Element => {
	const themePreference = usePreferencesStore((state) => state.theme)
	const textColor = useCSSVariable('--color-text') as string | undefined
	const primaryColor = useCSSVariable('--color-primary') as string
	const borderColor = useCSSVariable('--color-border')
	const cardColor = useCSSVariable('--color-card')
	const labelColor = useCSSVariable('--color-label') as string | undefined
	const { currentFloor, setCurrentFloor } = use(MapContext)
	const { t } = useTranslation(['accessibility'])

	const xIconColor = themePreference === 'dark' ? '#b6b6b6ff' : '#4a4a4aff'

	return (
		<View className="mx-2 mt-[110px] absolute right-0">
			{!showAllFloors && (
				<Pressable
					onPress={() => {
						toggleShowAllFloors()
					}}
					onLongPress={() => {
						if (currentFloor?.floor === 'EG') {
							toggleShowAllFloors()
						} else {
							setCurrentFloor({ floor: 'EG', manual: true })
							if (Platform.OS === 'ios' && currentFloor?.floor !== 'EG') {
								void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
							}
						}
					}}
				>
					<View
						className="rounded-[10px] mt-[5px] overflow-hidden bg-card"
						style={{
							borderWidth: !showAllFloors ? 1 : 0,
							borderColor: toColor(borderColor),
							backgroundColor: toColor(cardColor)
						}}
					>
						<View className="items-center self-center h-[38px] justify-center w-[38px]">
							<Text
								className="font-medium text-[15px]"
								style={{
									color: toColor(textColor)
								}}
							>
								{currentFloor?.floor === 'EG' ? '0' : currentFloor?.floor}
							</Text>
						</View>
					</View>
				</Pressable>
			)}
			{showAllFloors && (
				<Pressable
					onPress={() => {
						toggleShowAllFloors()
					}}
					className="items-center self-center h-[38px] justify-center w-[38px]"
				>
					<PlatformIcon
						ios={{
							name: 'xmark.circle.fill',
							size: 26
						}}
						android={{
							name: 'cancel',
							size: 26
						}}
						web={{
							name: 'X',
							size: 26
						}}
						style={{ color: xIconColor }}
					/>
				</Pressable>
			)}
			{showAllFloors && (
				<View
					className="rounded-[10px] border mt-[5px] overflow-hidden"
					style={{ borderColor: toColor(borderColor) }}
				>
					{floors.map((floor, index) => (
						<Pressable
							onPress={() => {
								if (Platform.OS === 'ios') {
									void Haptics.selectionAsync()
								}
								setCurrentFloor({ floor, manual: true })
							}}
							key={index}
						>
							<View
								className="items-center self-center h-[38px] justify-center w-[38px]"
								style={{
									borderBottomColor: toColor(borderColor),
									backgroundColor:
										currentFloor?.floor === floor
											? toColor(primaryColor)
											: toColor(cardColor),
									borderBottomWidth: index === floors.length - 1 ? 0 : 1
								}}
							>
								<Text
									className="font-medium text-[15px]"
									style={{
										color:
											showAllFloors && currentFloor?.floor === floor
												? getContrastColor(primaryColor)
												: toColor(textColor)
									}}
								>
									{floor === 'EG' ? '0' : floor}
								</Text>
							</View>
						</Pressable>
					))}
				</View>
			)}
			{Platform.OS !== 'web' && (
				<Pressable
					onPress={() => {
						setCameraTriggerKey((prev) => prev + 1)
					}}
					accessibilityLabel={t('map.centerOnCurrentLocation')}
				>
					<View
						className="rounded-[10px] border mt-[5px] overflow-hidden bg-card"
						style={{
							borderColor: toColor(borderColor),
							backgroundColor: toColor(cardColor)
						}}
					>
						<View className="items-center self-center h-[38px] justify-center w-[38px]">
							<PlatformIcon
								style={{ color: toColor(labelColor) }}
								ios={{
									name: 'location.fill',
									size: 18
								}}
								android={{
									name: 'near_me',
									size: 21,
									variant: 'outlined'
								}}
								web={{
									name: 'Locate',
									size: 18
								}}
							/>
						</View>
					</View>
				</Pressable>
			)}
		</View>
	)
}

export default memo(FloorPicker)
