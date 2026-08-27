import type React from 'react'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from '../Universal/icon'

interface AllRoomsAvailableProps {
	title: string
	subtitle: string
}

export const AllRoomsAvailable = ({
	title,
	subtitle
}: AllRoomsAvailableProps): React.JSX.Element => {
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const contrastOnPrimary = getContrastColor(primaryColor)

	return (
		<View className="flex-row px-3 py-[18px]">
			<View className="items-center flex-row flex-1 justify-between">
				<View
					className="items-center rounded-full h-10 justify-center me-3.5 w-10"
					style={{ backgroundColor: primaryColor }}
				>
					<PlatformIcon
						ios={{
							name: 'studentdesk',
							size: 18
						}}
						android={{
							name: 'school',
							size: 20
						}}
						web={{
							name: 'Notebook',
							size: 20
						}}
						style={{ color: contrastOnPrimary }}
					/>
				</View>

				<View className="flex-1 pe-3.5">
					<Text className="text-text text-base font-semibold mb-px">
						{title}
					</Text>
					<Text className="text-text text-sm font-normal">{subtitle}</Text>
				</View>
			</View>
		</View>
	)
}
