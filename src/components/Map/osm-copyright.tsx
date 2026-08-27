import type React from 'react'
import {
	Linking,
	Platform,
	Pressable,
	Text,
	type ViewStyle
} from 'react-native'
import Animated, { type AnimatedStyle } from 'react-native-reanimated'
import { useUniwind } from 'uniwind'

interface OsmCopyrightProps {
	style: AnimatedStyle<ViewStyle>
}

export const OsmCopyright = ({
	style
}: OsmCopyrightProps): React.JSX.Element => {
	const { theme: activeTheme } = useUniwind()
	const isDark = activeTheme === 'dark'
	const backgroundColor = isDark
		? Platform.OS === 'web'
			? 'rgba(166, 173, 181, 0.70)'
			: 'rgba(104, 106, 108, 0.7)'
		: 'rgba(218, 218, 218, 0.70)'

	return (
		<Animated.View
			className="items-end h-[30px] me-1 absolute right-0 z-[99]"
			style={style}
		>
			<Pressable
				onPress={() => {
					void Linking.openURL('https://www.openstreetmap.org/copyright')
				}}
				style={{
					backgroundColor,
					paddingHorizontal: 4,
					borderRadius: 4
				}}
			>
				<Text className="text-[13px]" numberOfLines={1} ellipsizeMode="tail">
					{'© OpenStreetMap'}
				</Text>
			</Pressable>
		</Animated.View>
	)
}
