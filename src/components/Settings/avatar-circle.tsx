import type React from 'react'
import {
	type ColorValue,
	type StyleProp,
	View,
	type ViewStyle
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

/**
 * AvatarCircle component that displays a circular image or icon with optional shadow and background color.
 * @param size The size of the avatar in pixels. Defaults to 50.
 * @param background The background color of the avatar.
 * @param children The content to display inside the avatar.
 * @param style Optional additional styles to apply to the avatar.
 * @returns A JSX element representing the Avatar component.
 */
const AvatarCircle = ({
	size = 55,
	background,
	children,
	style
}: {
	size?: number
	background?: ColorValue
	children: React.JSX.Element
	style?: StyleProp<ViewStyle>
}): React.JSX.Element => {
	const primaryColor = toColor(useCSSVariable('--color-primary'))

	return (
		<View
			className="justify-center items-center self-center"
			style={[
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: background ?? primaryColor
				},
				style
			]}
		>
			{children}
		</View>
	)
}

export default AvatarCircle
