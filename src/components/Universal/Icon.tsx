import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { type SFSymbol, SymbolView } from 'expo-symbols'
import { FileWarning } from 'lucide-react-native'
import * as icons from 'lucide-react-native/icons'
import type React from 'react'
import { Platform, Text, type TextStyle, type ViewStyle } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { MaterialIcon } from '@/types/material-icons'

export type LucideIcon = keyof typeof icons
interface PlatformIconProps {
	android: {
		name: MaterialIcon | CommunityIcon
		size: number
		variant?: 'filled' | 'outlined'
	}
	ios: {
		name: string
		size: number
		weight?:
			| 'ultraLight'
			| 'thin'
			| 'light'
			| 'regular'
			| 'medium'
			| 'semibold'
			| 'bold'
			| 'heavy'
			| 'black'
		variant?: string
		fallback?: boolean
		renderMode?:
			| 'multicolor'
			| 'monochrome'
			| 'hierarchical'
			| 'palette'
			| undefined
		variableValue?: number | undefined
		additionalColor?: string
	}
	web: {
		name: LucideIcon
		size: number
		variant?: 'filled' | 'outlined'
	}
	style?: TextStyle
}

export const lucidErrorIcon = {
	name: 'error',
	size: 24,
	color: 'red'
}

export const linkIcon = {
	ios: 'safari',
	android: 'link' as MaterialIcon,
	web: 'Link' as LucideIcon
}

const PlatformIcon = ({
	android,
	ios,
	web,
	style
}: PlatformIconProps): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)

	const lucidFallback = <FileWarning size={24} color={lucidErrorIcon.color} />

	if (Platform.OS === 'web') {
		if (web != null) {
			const LucideIcon = icons[web.name]

			return (
				<LucideIcon
					size={web.size}
					color={style?.color ?? theme.colors.primary}
					style={style as ViewStyle}
					fill={web.variant === 'filled' ? 'currentColor' : 'none'}
					fillRule="evenodd"
				/>
			)
		}
		return lucidFallback
	}
	if (Platform.OS === 'ios') {
		return (ios.fallback ?? false) ? (
			<MaterialCommunityIcons
				name={ios.name as keyof typeof MaterialCommunityIcons.glyphMap}
				size={ios.size}
				color={style?.color ?? theme.colors.primary}
				style={{
					width: ios.size,
					height: ios.size,
					...styles.iosFallbackOffset,
					...style
				}}
			/>
		) : (
			<SymbolView
				name={
					ios.variant === 'fill' && !ios.name.includes('.')
						? (`${ios.name}.fill` as SFSymbol)
						: (ios.name as SFSymbol)
				}
				size={ios.size + 5}
				weight={ios.weight ?? 'regular'}
				colors={
					ios.renderMode === 'palette' || ios.renderMode === 'hierarchical'
						? [
								style?.color ?? theme.colors.primary,
								...(ios.additionalColor != null ? [ios.additionalColor] : [])
							]
						: undefined
				}
				tintColor={style?.color ?? theme.colors.primary}
				type={ios.renderMode as never}
				resizeMode="scaleAspectFit"
				style={style as ViewStyle}
			/>
		)
	}
	return (
		<Text
			style={{
				...(android.variant === 'outlined'
					? styles.androidIconOutlined
					: styles.androidIconFilled),
				fontSize: android.size,
				lineHeight: android.size,
				color: style?.color ?? theme.colors.primary,
				...style
			}}
		>
			{communityIcons.includes(android.name) ? (
				<MaterialCommunityIcons
					name={android.name as keyof typeof MaterialCommunityIcons.glyphMap}
					size={android.size}
					color={style?.color ?? theme.colors.primary}
					style={{ ...styles.communityIcon, ...style }}
				/>
			) : (
				android.name
			)}
		</Text>
	)
}

export default PlatformIcon

const communityIcons: string[] = ['instagram', 'github', 'linkedin']

export type CommunityIcon = 'instagram' | 'github' | 'map-marker'

const stylesheet = createStyleSheet(() => ({
	androidIconFilled: {
		fontFamily: 'MaterialSymbolsRoundedFill'
	},
	androidIconOutlined: {
		fontFamily: 'MaterialSymbolsRoundedOutline'
	},
	communityIcon: {
		paddingTop: 50
	},
	iosFallbackOffset: {
		marginRight: -2
	}
}))
