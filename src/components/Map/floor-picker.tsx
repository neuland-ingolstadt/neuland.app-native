import * as Haptics from 'expo-haptics'
import type React from 'react'
import { memo, use } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { MapContext } from '@/contexts/map'
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
	const { currentFloor, setCurrentFloor } = use(MapContext)
	const { t } = useTranslation(['accessibility'])
	const { theme } = useUniwind()
	const isDark = theme === 'dark'
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const borderColor = String(
		toColor(useCSSVariable('--color-border')) ?? '#d8d8d8'
	)
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')
	const labelColor = toColor(useCSSVariable('--color-label'))
	const xIconColor = isDark ? '#b6b6b6ff' : '#4a4a4aff'

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
						className="rounded-[10px] mt-[5px] overflow-hidden"
						style={{
							borderWidth: !showAllFloors ? 1 : 0,
							backgroundColor: cardColor,
							borderColor
						}}
					>
						<View className="content-center items-center self-center h-[38px] justify-center w-[38px]">
							<Text
								className="font-medium text-[15px]"
								style={{ color: textColor }}
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
					className="content-center items-center self-center h-[38px] justify-center w-[38px]"
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
					style={{ borderColor }}
				>
					{floors.map((floor, index) => {
						const isCurrent = currentFloor?.floor === floor
						const isLast = index === floors.length - 1
						return (
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
									className="content-center items-center self-center h-[38px] justify-center w-[38px]"
									style={{
										borderBottomColor: borderColor,
										backgroundColor: isCurrent ? primaryColor : cardColor,
										borderBottomWidth: isLast ? 0 : 1
									}}
								>
									<Text
										className="font-medium text-[15px]"
										style={{
											color: isCurrent ? getContrastColor(textColor) : textColor
										}}
									>
										{floor === 'EG' ? '0' : floor}
									</Text>
								</View>
							</Pressable>
						)
					})}
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
						className="rounded-[10px] border mt-[5px] overflow-hidden"
						style={{ borderColor, backgroundColor: cardColor }}
					>
						<View className="content-center items-center self-center h-[38px] justify-center w-[38px]">
							<PlatformIcon
								style={{ color: labelColor }}
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
