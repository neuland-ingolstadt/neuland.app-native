import { HeaderTitle } from '@react-navigation/elements'
import { Stack } from 'expo-router'
import type { ViewStyle } from 'react-native'
import { Platform, useWindowDimensions, View } from 'react-native'
import Animated, { type useAnimatedStyle } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

// getPlatformHeaderButtons (@/utils/header-buttons) never renders more than
// one button per side, so a fixed reserve is enough for every screen using
// this header — no per-screen tuning needed.
const HEADER_SIDE_BUTTON_WIDTH = 60

interface DetailStackHeaderProps {
	title: string
	headerStyle: ReturnType<typeof useAnimatedStyle<ViewStyle>>
}

/**
 * Scroll-linked detail-screen header title: translates up from below the bar
 * into the centred position as the user scrolls, blending with the
 * in-content title below it. Shared by every detail screen using this
 * animation (food, exam, lecture, lecturer, sports/CL events) so a long
 * title is constrained and truncated once here instead of in six
 * near-identical copies — a fully custom `headerTitle` gets no native
 * truncation against the header's side buttons.
 */
export function DetailStackHeader({
	title,
	headerStyle
}: DetailStackHeaderProps): React.JSX.Element {
	const textColor = toColor(useCSSVariable('--color-text'))
	const { width } = useWindowDimensions()

	return (
		<Stack.Screen
			options={{
				headerTitle: (props) => (
					<View
						className="overflow-hidden"
						style={{
							marginBottom: Platform.OS === 'ios' ? -10 : 0,
							paddingRight: Platform.OS === 'ios' ? 0 : 50,
							maxWidth: width - HEADER_SIDE_BUTTON_WIDTH * 2
						}}
					>
						<Animated.View style={headerStyle}>
							<HeaderTitle
								{...props}
								tintColor={String(textColor)}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{title}
							</HeaderTitle>
						</Animated.View>
					</View>
				)
			}}
		/>
	)
}
