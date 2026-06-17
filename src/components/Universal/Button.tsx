import Color from 'color'
import type React from 'react'
import {
	ActivityIndicator,
	type StyleProp,
	StyleSheet,
	Text,
	TouchableOpacity,
	type ViewStyle
} from 'react-native'
import {
	createStyleSheet,
	UnistylesRuntime,
	useStyles
} from 'react-native-unistyles'
import { getContrastColor } from '@/utils/ui-utils'

interface ButtonProps {
	variant?: 'primary' | 'secondary'
	disabled?: boolean
	loading?: boolean
	onPress: () => void
	children: string
	style?: StyleProp<ViewStyle>
}

const Button = ({
	variant = 'primary',
	disabled = false,
	loading = false,
	onPress,
	children,
	style
}: ButtonProps): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)
	const isDisabled = disabled || loading

	const indicatorColor =
		variant === 'primary'
			? isDisabled
				? UnistylesRuntime.themeName === 'dark'
					? Color(getContrastColor(theme.colors.primary)).lighten(0.1).hex()
					: Color(getContrastColor(theme.colors.primary)).darken(0.1).hex()
				: getContrastColor(theme.colors.primary)
			: theme.colors.primary

	return (
		<TouchableOpacity
			disabled={isDisabled}
			onPress={onPress}
			style={[styles.button(variant, isDisabled), style]}
		>
			{loading ? (
				<ActivityIndicator color={indicatorColor} size={15} />
			) : (
				<Text style={styles.buttonText(variant, isDisabled)}>{children}</Text>
			)}
		</TouchableOpacity>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	button: (variant: 'primary' | 'secondary', disabled: boolean) => {
		if (variant === 'secondary') {
			return {
				height: 48,
				justifyContent: 'center',
				alignItems: 'center',
				borderRadius: theme.radius.md,
				backgroundColor: theme.colors.card,
				borderWidth: StyleSheet.hairlineWidth,
				borderColor: theme.colors.border,
				opacity: disabled ? 0.6 : 1
			}
		}

		return {
			height: 48,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 8,
			backgroundColor: disabled
				? UnistylesRuntime.themeName === 'dark'
					? Color(theme.colors.primary).darken(0.3).hex()
					: Color(theme.colors.primary).lighten(0.3).hex()
				: theme.colors.primary
		}
	},
	buttonText: (variant: 'primary' | 'secondary', disabled: boolean) => {
		if (variant === 'secondary') {
			return {
				fontWeight: '600',
				fontSize: 16,
				color: theme.colors.primary
			}
		}

		return {
			fontWeight: '600',
			fontSize: 16,
			color: disabled
				? UnistylesRuntime.themeName === 'dark'
					? Color(getContrastColor(theme.colors.primary)).lighten(0.1).hex()
					: Color(getContrastColor(theme.colors.primary)).darken(0.1).hex()
				: getContrastColor(theme.colors.primary)
		}
	}
}))

export default Button
