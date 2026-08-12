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
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

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
	const borderColor = String(
		toColor(useCSSVariable('--color-border')) ?? '#d8d8d8'
	)
	const textColor = toColor(useCSSVariable('--color-text'))
	const cancelWidth = useSharedValue(0)
	const cancelOpacity = useSharedValue(0)
	const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const animatedCancelStyle = useAnimatedStyle(() => ({
		width: cancelWidth.value,
		opacity: cancelOpacity.value
	}))

	const animate = (toValue: number): void => {
		cancelWidth.value = withTiming(toValue, { duration: 200 })
		cancelOpacity.value = withTiming(toValue === 0 ? 0 : 1, {
			duration: 250
		})
	}

	useEffect(() => {
		return () => {
			if (blurTimeoutRef.current) {
				clearTimeout(blurTimeoutRef.current)
			}
		}
	}, [])

	const width = t('misc.cancel').length * 11

	return (
		<View className="flex-row h-10 mb-2.5 mt-1">
			<TextInput
				testID="map-search-input"
				ref={inputRef}
				className="bg-card rounded-mg flex-1 text-[17px] h-11 mb-2.5 px-2.5"
				style={{
					...hairlineBorder,
					borderColor,
					color: textColor
				}}
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
