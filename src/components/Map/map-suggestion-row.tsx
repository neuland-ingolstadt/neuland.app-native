import type React from 'react'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import type { MaterialIcon } from '@/types/material-icons'
import { formatFriendlyTime } from '@/utils/date-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon, { type WebIcon } from '../Universal/icon'

interface MapSuggestionRowProps {
	testID?: string
	disabled?: boolean
	onPress: () => void
	iosIcon: string
	androidIcon: MaterialIcon
	webIcon: WebIcon
	title: string
	subtitle: React.ReactNode
	startTime: Date
	endTime: Date
	titleNumberOfLines?: number
}

export const MapSuggestionRow = ({
	testID,
	disabled = false,
	onPress,
	iosIcon,
	androidIcon,
	webIcon,
	title,
	subtitle,
	startTime,
	endTime,
	titleNumberOfLines
}: MapSuggestionRowProps): React.JSX.Element => {
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const contrastOnPrimary = getContrastColor(primaryColor)

	return (
		<Pressable
			testID={testID}
			disabled={disabled}
			className="flex-row px-3 py-[18px]"
			onPress={onPress}
		>
			<View className="items-center flex-row flex-1 justify-between">
				<View
					className="items-center rounded-full h-10 justify-center me-3.5 w-10"
					style={{ backgroundColor: primaryColor }}
				>
					<PlatformIcon
						ios={{
							name: iosIcon,
							size: 18
						}}
						android={{
							name: androidIcon,
							size: 20
						}}
						web={{
							name: webIcon,
							size: 20
						}}
						style={{ color: contrastOnPrimary }}
					/>
				</View>

				<View className="flex-1 pe-3.5">
					<Text
						className="text-text text-base font-semibold mb-px"
						numberOfLines={titleNumberOfLines}
					>
						{title}
					</Text>
					<Text className="text-text text-sm font-normal">{subtitle}</Text>
				</View>
			</View>
			<View className="flex-col justify-center">
				<Text className="text-label" style={{ fontVariant: ['tabular-nums'] }}>
					{formatFriendlyTime(startTime)}
				</Text>
				<Text className="text-text" style={{ fontVariant: ['tabular-nums'] }}>
					{formatFriendlyTime(endTime)}
				</Text>
			</View>
		</Pressable>
	)
}
