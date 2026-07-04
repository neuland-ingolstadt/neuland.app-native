import type React from 'react'
import { type GestureResponderEvent, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

interface LibraryCardProps {
	onPress: ((event: GestureResponderEvent) => void) | null | undefined
	iconProps: {
		ios: { name: string; size: number }
		android: {
			name: MaterialIcon
			size: number
			variant?: 'outlined' | 'filled'
		}
		web: { name: LucideIcon; size: number }
	}
	title: string
	description: string
}

const LibraryCard = ({
	onPress,
	iconProps,
	title,
	description
}: LibraryCardProps): React.JSX.Element => {
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const labelColor = toColor(useCSSVariable('--color-label'))
	return (
		<Pressable
			className="items-center bg-card border-border rounded-md flex-row gap-1.5 justify-between p-4"
			style={hairlineBorder}
			onPress={onPress}
		>
			<View className="flex-col flex-1 gap-1.5 justify-center">
				<View className="items-center flex-row gap-2.5">
					<PlatformIcon {...iconProps} style={{ color: primaryColor }} />
					<Text className="text-text text-base font-bold">{title}</Text>
				</View>
				<Text className="text-text text-sm" numberOfLines={3}>
					{description}
				</Text>
			</View>
			<PlatformIcon
				ios={{ name: 'chevron.forward', size: 14 }}
				android={{ name: 'chevron_right', size: 24 }}
				web={{ name: 'ChevronRight', size: 24 }}
				style={{ color: labelColor }}
			/>
		</Pressable>
	)
}

export default LibraryCard
