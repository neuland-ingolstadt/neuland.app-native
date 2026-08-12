import type React from 'react'
import { Platform, Pressable } from 'react-native'
import { useCSSVariable } from 'uniwind'
import type { MaterialIcon } from '@/types/material-icons'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon, { type WebIcon } from '../Universal/icon'

interface SheetActionButtonProps {
	testID: string
	accessibilityLabel: string
	onPress: () => void
	iosFilledSymbol: string
	androidName: MaterialIcon
	webName: WebIcon
}

const IOS_ACTION_SIZE = 40

export const SheetActionButton = ({
	testID,
	accessibilityLabel,
	onPress,
	iosFilledSymbol,
	androidName,
	webName
}: SheetActionButtonProps): React.JSX.Element => {
	const labelColor = String(
		toColor(useCSSVariable('--color-label-secondary')) ?? '#8e8e93'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')

	return (
		<Pressable
			testID={testID}
			accessible
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			onPress={onPress}
			hitSlop={8}
			className={
				Platform.OS === 'ios'
					? 'items-center justify-center'
					: 'h-10 w-10 items-center justify-center rounded-full bg-label-background'
			}
			style={
				Platform.OS === 'ios'
					? { width: IOS_ACTION_SIZE, height: IOS_ACTION_SIZE }
					: undefined
			}
		>
			<PlatformIcon
				ios={{
					name: iosFilledSymbol,
					size: IOS_ACTION_SIZE - 7,
					renderMode: 'hierarchical'
				}}
				android={{ name: androidName, size: 22 }}
				web={{ name: webName, size: 18 }}
				style={{
					color: Platform.OS === 'ios' ? labelColor : textColor,
					...(Platform.OS === 'ios'
						? { width: IOS_ACTION_SIZE, height: IOS_ACTION_SIZE }
						: {})
				}}
			/>
		</Pressable>
	)
}
