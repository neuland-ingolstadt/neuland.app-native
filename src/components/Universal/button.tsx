import Color from 'color'
import type React from 'react'
import {
	ActivityIndicator,
	type StyleProp,
	Text,
	TouchableOpacity,
	useColorScheme,
	type ViewStyle
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { getContrastColor } from '@/utils/ui-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

interface ButtonProps {
	variant?: 'primary' | 'secondary'
	disabled?: boolean
	loading?: boolean
	onPress: () => void
	children: string
	style?: StyleProp<ViewStyle>
}

function resolveActiveTheme(
	theme: string,
	colorScheme: 'light' | 'dark' | null | undefined
): 'light' | 'dark' {
	if (theme === 'light' || theme === 'dark') {
		return theme
	}

	return colorScheme === 'dark' ? 'dark' : 'light'
}

const Button = ({
	variant = 'primary',
	disabled = false,
	loading = false,
	onPress,
	children,
	style
}: ButtonProps): React.JSX.Element => {
	const themePreference = usePreferencesStore((state) => state.theme)
	const colorScheme = useColorScheme()
	const activeTheme = resolveActiveTheme(themePreference, colorScheme)
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const isDisabled = disabled || loading

	const disabledPrimaryBg =
		activeTheme === 'dark'
			? Color(primaryColor).darken(0.3).hex()
			: Color(primaryColor).lighten(0.3).hex()

	const contrastColor = getContrastColor(primaryColor)
	const disabledContrastColor =
		activeTheme === 'dark'
			? Color(contrastColor).lighten(0.1).hex()
			: Color(contrastColor).darken(0.1).hex()

	const indicatorColor =
		variant === 'primary'
			? isDisabled
				? disabledContrastColor
				: contrastColor
			: primaryColor

	const buttonClassName =
		variant === 'secondary'
			? `h-12 justify-center items-center rounded-base bg-card border-border ${isDisabled ? 'opacity-60' : ''}`
			: 'h-12 justify-center items-center rounded-base'

	return (
		<TouchableOpacity
			disabled={isDisabled}
			onPress={onPress}
			className={buttonClassName}
			style={[
				variant === 'secondary'
					? hairlineBorder
					: { backgroundColor: isDisabled ? disabledPrimaryBg : primaryColor },
				style
			]}
		>
			{loading ? (
				<ActivityIndicator color={indicatorColor} size={15} />
			) : (
				<Text
					className="font-semibold text-base"
					style={{
						color:
							variant === 'secondary'
								? primaryColor
								: isDisabled
									? disabledContrastColor
									: contrastColor
					}}
				>
					{children}
				</Text>
			)}
		</TouchableOpacity>
	)
}

export default Button
