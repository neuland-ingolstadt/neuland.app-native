import type React from 'react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, TextInput, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import {
	IosGlassSurface,
	iosGlassHairlineBorder
} from '@/components/Universal/ios-glass-surface'
import { toColor } from '@/utils/uniwind-utils'

const SEARCH_RADIUS = 17

const iosSearchSurfaceBaseStyle = {
	borderCurve: 'continuous' as const,
	borderRadius: SEARCH_RADIUS,
	flex: 1,
	height: 44,
	justifyContent: 'center' as const,
	overflow: 'hidden' as const
}

interface MapSearchBarProps {
	value: string
	onChangeText: (text: string) => void
	onFocus: () => void
	onCancel: () => void
	onFocusChange: (focused: boolean) => void
	inputRef: React.RefObject<TextInput | null>
}

export const MapSearchBar = ({
	value,
	onChangeText,
	onFocus,
	onCancel,
	onFocusChange,
	inputRef
}: MapSearchBarProps): React.JSX.Element => {
	const { t } = useTranslation('common')
	const labelColor = toColor(useCSSVariable('--color-label'))
	const textColor = toColor(useCSSVariable('--color-text'))
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const labelColorString = String(labelColor ?? '#606062')
	const cancelWidth = useSharedValue(0)
	const cancelOpacity = useSharedValue(0)
	const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const animatedCancelStyle = useAnimatedStyle(() => ({
		width: cancelWidth.get(),
		opacity: cancelOpacity.get()
	}))

	const animate = (toValue: number): void => {
		cancelWidth.set(withTiming(toValue, { duration: 200 }))
		cancelOpacity.set(
			withTiming(toValue === 0 ? 0 : 1, {
				duration: 250
			})
		)
	}

	useEffect(() => {
		return () => {
			if (blurTimeoutRef.current) {
				clearTimeout(blurTimeoutRef.current)
			}
		}
	}, [])

	const width = t('misc.cancel').length * 11

	const searchInput = (
		<TextInput
			testID="map-search-input"
			ref={inputRef}
			className={
				Platform.OS === 'ios'
					? 'flex-1 text-[17px] px-2.5 bg-transparent'
					: 'bg-card rounded-mg flex-1 text-[17px] h-11 px-2.5 border-hairline border-border'
			}
			style={[
				{ color: textColor },
				Platform.OS === 'ios'
					? {
							height: 44,
							lineHeight: 20,
							paddingBottom: 11,
							paddingTop: 11
						}
					: undefined
			]}
			placeholder={t('pages.map.search.hint')}
			placeholderTextColor={labelColor}
			value={value}
			enablesReturnKeyAutomatically
			clearButtonMode="always"
			enterKeyHint="search"
			onChangeText={onChangeText}
			onFocus={() => {
				onFocusChange(true)
				animate(width)
				onFocus()
			}}
			onBlur={() => {
				if (blurTimeoutRef.current) {
					clearTimeout(blurTimeoutRef.current)
				}

				blurTimeoutRef.current = setTimeout(
					() => {
						onFocusChange(false)
						animate(0)
					},
					Platform.OS === 'web' ? 200 : 0
				)
			}}
		/>
	)

	const iosSearchSurfaceStyle = [
		iosSearchSurfaceBaseStyle,
		iosGlassHairlineBorder(labelColorString)
	]

	return (
		<View className="flex-row items-center mb-2.5 mt-1 min-h-11">
			{Platform.OS === 'ios' ? (
				<IosGlassSurface
					isInteractive
					fallbackBackgroundColor={cardColor}
					style={iosSearchSurfaceStyle}
				>
					{searchInput}
				</IosGlassSurface>
			) : (
				searchInput
			)}

			<Animated.View className="justify-center" style={animatedCancelStyle}>
				<Pressable
					testID="map-search-cancel"
					onPress={onCancel}
					className="self-center ps-2.5 pe-0.5"
				>
					<Text
						className="text-primary text-[15px] font-semibold text-center"
						numberOfLines={1}
						allowFontScaling={false}
						ellipsizeMode="clip"
					>
						{t('misc.cancel')}
					</Text>
				</Pressable>
			</Animated.View>
		</View>
	)
}
