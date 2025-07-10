import type React from 'react'
import type { JSX } from 'react'
import {
	type ColorValue,
	type StyleProp,
	View,
	type ViewStyle
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
	children: JSX.Element
	style?: StyleProp<ViewStyle>
}): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)

	return (
		<View
			style={[styles.avatar(size, background || theme.colors.primary), style]}
		>
			{children}
		</View>
	)
}

const stylesheet = createStyleSheet({
	avatar: (size: number, background: ColorValue) => ({
		width: size,
		height: size,
		borderRadius: size / 2,
		backgroundColor: background,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center'
	})
})

export default AvatarCircle
