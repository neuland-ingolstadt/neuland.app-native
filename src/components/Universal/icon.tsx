import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { type SFSymbol, SymbolView } from 'expo-symbols'
import { FileWarning } from 'lucide-react-native'
import * as icons from 'lucide-react-native/icons'
import type React from 'react'
import { Platform, Text, type TextStyle, type ViewStyle } from 'react-native'
import { useCSSVariable } from 'uniwind'
import type { MaterialIcon } from '@/types/material-icons'
import { toColor } from '@/utils/uniwind-utils'

export type LucideIcon = keyof typeof icons
export type CommunityIcon = 'instagram' | 'github' | 'map-marker'
export type WebIcon = LucideIcon | CommunityIcon

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
		name: WebIcon
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

const androidIconFilled = { fontFamily: 'MaterialSymbolsRoundedFill' }
const androidIconOutlined = { fontFamily: 'MaterialSymbolsRoundedOutline' }

const PlatformIcon = ({
	android,
	ios,
	web,
	style
}: PlatformIconProps): React.JSX.Element => {
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)

	const lucidFallback = <FileWarning size={24} color={lucidErrorIcon.color} />

	if (Platform.OS === 'web') {
		if (web != null) {
			if (communityIcons.includes(web.name)) {
				return (
					<MaterialCommunityIcons
						name={web.name as keyof typeof MaterialCommunityIcons.glyphMap}
						size={web.size}
						color={style?.color ?? primaryColor}
						style={style as TextStyle}
					/>
				)
			}

			const LucideIcon = icons[web.name as LucideIcon]

			return (
				<LucideIcon
					size={web.size}
					color={style?.color ?? primaryColor}
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
				color={style?.color ?? primaryColor}
				style={{
					width: ios.size,
					height: ios.size,
					marginRight: -2,
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
								style?.color ?? primaryColor,
								...(ios.additionalColor != null ? [ios.additionalColor] : [])
							]
						: undefined
				}
				tintColor={style?.color ?? primaryColor}
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
					? androidIconOutlined
					: androidIconFilled),
				fontSize: android.size,
				lineHeight: android.size,
				color: style?.color ?? primaryColor,
				...style
			}}
		>
			{communityIcons.includes(android.name) ? (
				<MaterialCommunityIcons
					name={android.name as keyof typeof MaterialCommunityIcons.glyphMap}
					size={android.size}
					color={style?.color ?? primaryColor}
					style={{ paddingTop: 50, ...style }}
				/>
			) : (
				android.name
			)}
		</Text>
	)
}

export default PlatformIcon

const communityIcons: string[] = ['instagram', 'github', 'linkedin']
