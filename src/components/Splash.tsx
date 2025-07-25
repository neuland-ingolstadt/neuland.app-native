import * as SplashScreen from 'expo-splash-screen'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native'
import Animated, {
	Easing,
	interpolate,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import Svg, { G, Path } from 'react-native-svg'
import { UnistylesRuntime, useStyles } from 'react-native-unistyles'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'

const AnimatedSvg = Animated.createAnimatedComponent(Svg)

type LogoProps = {
	style: ViewStyle | ViewStyle[]
	width: number
	height: number
	color: string
	opacity: number
}
const Logo = ({ style, width, height, color, opacity }: LogoProps) => (
	<AnimatedSvg
		viewBox="0 0 75.09 95.05"
		width={width}
		height={height}
		style={style}
	>
		<G>
			<Path
				fill={color}
				d="M60.93,70.48a27,27,0,0,1,7.29,16.06A41.94,41.94,0,0,1,44.71,95c-.62,0-1.24,0-1.87,0a42,42,0,0,1-25.79-8.82c-.9-.7-1.77-1.43-2.61-2.21a26.29,26.29,0,0,1,1.1-4A27.26,27.26,0,0,1,23.8,68.19a27,27,0,0,1,3-2.16,24.59,24.59,0,0,1,3.25-1.72,25.58,25.58,0,0,1,4.56-1.57c0-.34,0-.68-.06-1-.13-1.87-.32-3.71-.59-5.53h0c-.24-1.69-.54-3.36-.89-5-.12-.57-.25-1.13-.39-1.69a72.6,72.6,0,0,0-2.48-8.2h0c-.61-1.64-1.27-3.26-2-4.84-.14-.32-.29-.63-.45-.95-.37.31-.74.64-1.09,1s-1,1-1.43,1.47A24.26,24.26,0,0,0,22,42.58a24.13,24.13,0,0,0-2.5,15.47c.06.42.15.84.25,1.25-.26-.38-.51-.78-.74-1.18a22.8,22.8,0,0,1-1.75-19.34A26,26,0,0,0,2,62.55c0,.21,0,.43,0,.64A42.17,42.17,0,0,1,.74,53c0-.89,0-1.77.08-2.64A41.88,41.88,0,0,1,8.48,28.62a26.87,26.87,0,0,0-3.83-.27A26.37,26.37,0,0,0,0,28.76a19.33,19.33,0,0,1,16.47-9.19c.23,0,.46,0,.69,0a1.07,1.07,0,0,1,.25,0,.86.86,0,0,1,.06-.23,0,0,0,0,1,0,0q.24-.94.57-1.86A27,27,0,0,1,37.7,0,26.66,26.66,0,0,0,34,11.79a42.1,42.1,0,0,1,34.36,7.67,26.12,26.12,0,0,0-30.22,4.4h.51A22.75,22.75,0,0,1,58.21,35a24,24,0,0,0-14.89-5.14,23.62,23.62,0,0,0-3.88.32,22.78,22.78,0,0,0-5.07,1.4c-.57.22-1.13.47-1.67.74q1.57,2.12,3,4.35c.25.38.49.77.72,1.16a72.83,72.83,0,0,1,7.13,15.48,71.72,71.72,0,0,1,2.32,9.07,26.54,26.54,0,0,1,6.81,2.16c.48.21.94.45,1.4.7A26.52,26.52,0,0,1,59,68.61,24.6,24.6,0,0,1,60.93,70.48Z"
			/>
			<Path
				fill={color}
				opacity={opacity}
				d="M56.34,51.34a10.62,10.62,0,0,0,13.13,7.27,10.48,10.48,0,0,0,5.62-3.91,14.92,14.92,0,0,1-9.66-10.06,14.74,14.74,0,0,1-.34-6.74,9.59,9.59,0,0,0-1.47.3,10.72,10.72,0,0,0-5.47,3.69,10.83,10.83,0,0,0-1,1.54A10.52,10.52,0,0,0,56.34,51.34Z"
			/>
		</G>
	</AnimatedSvg>
)

type Props = { isReady: boolean }

export function Splash({ isReady, children }: React.PropsWithChildren<Props>) {
	const isDark = UnistylesRuntime.themeName === 'dark'
	const { theme } = useStyles()
	const [loaded, setLoaded] = useState(false)
	const [hideSplash, setHideSplash] = useState(false)
	const showSplashScreen = usePreferencesStore(
		(state) => state.showSplashScreen
	)

	const intro = useSharedValue(0)
	const introBackground = useSharedValue(0)

	useEffect(() => {
		setLoaded(true)
	}, [])

	const logoSize = 190
	const logoWidth = logoSize
	const logoHeight = logoSize
	const iosXShift = 20
	const iosMarginStyle: ViewStyle =
		Platform.OS === 'ios' ? { marginLeft: -iosXShift / 2 } : {}

	const animatedLogoStyle = useAnimatedStyle(() => ({
		transform: showSplashScreen
			? [
					{
						scale: interpolate(
							intro.value,
							[0, 0.2, 0.4, 1],
							[1, 1, 0.8, 10],
							'clamp'
						)
					}
				]
			: [],
		opacity: interpolate(intro.value, [0, 0.7, 0.8, 1], [1, 1, 0.4, 0], 'clamp')
	}))

	const animatedBackgroundStyle = useAnimatedStyle(() => ({
		backgroundColor: theme.colors.contrast,
		opacity: interpolate(introBackground.value, [0, 1], [1, 0], 'clamp')
	}))

	const animateSplashWithTransformation = () => {
		intro.value = withTiming(0.2, { duration: 100 }, () => {
			intro.value = withTiming(0.4, { duration: 200 }, () => {
				runOnJS(animateSplashFadeOut)()
			})
		})
	}

	const animateSplashFadeOut = () => {
		intro.value = withTiming(
			1,
			{ duration: 500, easing: Easing.out(Easing.exp) },
			() => {
				introBackground.value = withTiming(1, { duration: 200 }, () => {
					runOnJS(setHideSplash)(true)
				})
			}
		)
	}

	useEffect(() => {
		if (isReady && loaded) {
			SplashScreen.hideAsync()
			if (showSplashScreen) {
				animateSplashWithTransformation()
			} else {
				animateSplashFadeOut()
			}
		}
	}, [isReady, loaded, showSplashScreen])

	return (
		<View style={StyleSheet.absoluteFill}>
			{children}
			{!hideSplash && Platform.OS !== 'web' && (
				<>
					<Animated.View
						style={[StyleSheet.absoluteFill, animatedBackgroundStyle]}
					/>
					<Animated.View
						style={[
							StyleSheet.absoluteFill,
							{ justifyContent: 'center', alignItems: 'center' }
						]}
					>
						<Logo
							width={logoWidth}
							height={logoHeight}
							color={isDark ? '#1578e1' : '#1a1a1a'}
							opacity={isDark ? 0.25 : 0.5}
							style={[animatedLogoStyle, iosMarginStyle]}
						/>
					</Animated.View>
				</>
			)}
		</View>
	)
}
