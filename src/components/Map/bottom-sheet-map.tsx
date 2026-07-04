import type BottomSheet from '@gorhom/bottom-sheet'
import Color from 'color'
import type { FeatureCollection } from 'geojson'
import React, { use, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, TextInput, View } from 'react-native'
import Animated, {
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable, useUniwind } from 'uniwind'
import { StyledBottomSheet } from '@/components/Universal/styled'
import { MapContext } from '@/contexts/map'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import AttributionLink from './attribution-link'
import AvailableRoomsSuggestions from './available-rooms-suggestions'
import BottomSheetBackground from './bottom-sheet-background'
import NextLectureSuggestion from './next-lecture-suggestion'
import SearchHistory from './search-history'
import SearchResults from './search-results'

interface MapBottomSheetProps {
	bottomSheetRef: React.RefObject<BottomSheet | null>
	currentPosition: SharedValue<number>
	handlePresentModalPress: () => void
	allRooms: FeatureCollection
}

const IOS_SNAP_POINTS = ['20%', '39%', '90%']
const DEFAULT_SNAP_POINTS = ['10%', '30%', '92%']

const MapBottomSheet = ({
	bottomSheetRef,
	currentPosition,
	handlePresentModalPress,
	allRooms
}: MapBottomSheetProps): React.JSX.Element => {
	const { theme } = useUniwind()
	const isDark = theme === 'dark'
	const { t } = useTranslation('common')
	const { localSearch, setLocalSearch, searchHistory } = use(MapContext)
	const labelColor = toColor(useCSSVariable('--color-label'))
	const labelTertiaryColor = toColor(useCSSVariable('--color-label-tertiary'))
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const borderColor = String(
		toColor(useCSSVariable('--color-border')) ?? '#d8d8d8'
	)
	const textColor = toColor(useCSSVariable('--color-text'))
	const inputBackground = isDark
		? Color(cardColor)
				.lighten(Platform.OS === 'ios' ? 0.3 : 0.1)
				.hex()
		: Color(cardColor)
				.darken(Platform.OS === 'ios' ? 0.03 : 0.01)
				.hex()

	// biome-ignore lint/suspicious/noExplicitAny: TODO
	const textInputRef = useRef<any>(null)
	const [searchFocused, setSearchFocused] = React.useState(false)
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

	React.useEffect(() => {
		return () => {
			if (blurTimeoutRef.current) {
				clearTimeout(blurTimeoutRef.current)
			}
		}
	}, [])

	const width = t('misc.cancel').length * 11

	return (
		<StyledBottomSheet
			ref={bottomSheetRef}
			index={1}
			snapPoints={Platform.OS === 'ios' ? IOS_SNAP_POINTS : DEFAULT_SNAP_POINTS}
			backgroundComponent={BottomSheetBackground}
			animatedPosition={currentPosition}
			keyboardBehavior="extend"
			onChange={(index) => {
				if (index <= 1) {
					if (localSearch !== '') {
						setLocalSearch('')
					}
					textInputRef.current?.blur()
				}
			}}
			enableDynamicSizing={false}
			handleIndicatorStyle={{ backgroundColor: labelTertiaryColor }}
		>
			<View className="px-page">
				<View className="flex-row h-10 mb-2.5">
					<TextInput
						ref={textInputRef}
						className="rounded-mg flex-1 text-[17px] h-10 mb-2.5 px-2.5"
						style={{
							...hairlineBorder,
							backgroundColor: inputBackground,
							borderColor,
							color: textColor
						}}
						placeholder={t('pages.map.search.hint')}
						placeholderTextColor={labelColor}
						value={localSearch}
						enablesReturnKeyAutomatically
						clearButtonMode="always"
						enterKeyHint="search"
						onChangeText={(text) => {
							setLocalSearch(text)
						}}
						onFocus={() => {
							setSearchFocused(true)
							animate(width)
							bottomSheetRef.current?.expand()
						}}
						onBlur={() => {
							if (blurTimeoutRef.current) {
								clearTimeout(blurTimeoutRef.current)
							}

							blurTimeoutRef.current = setTimeout(
								() => {
									setSearchFocused(false)
									animate(0)
								},
								Platform.OS === 'web' ? 200 : 0
							)
						}}
					/>

					<Animated.View className="justify-center" style={animatedCancelStyle}>
						<Pressable
							onPress={() => {
								setLocalSearch('')
								textInputRef.current?.blur()
								bottomSheetRef.current?.snapToIndex(1)
							}}
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

				{searchFocused && localSearch === '' && searchHistory.length !== 0 && (
					<SearchHistory handlePresentModalPress={handlePresentModalPress} />
				)}

				{searchFocused && localSearch === '' && (
					<Text className="text-label text-base pt-[60px] py-[30px] text-center">
						{t('pages.map.search.placeholder')}
					</Text>
				)}

				{localSearch !== '' ? (
					<SearchResults
						handlePresentModalPress={handlePresentModalPress}
						allRooms={allRooms}
					/>
				) : searchFocused ? null : (
					<>
						<NextLectureSuggestion
							allRooms={allRooms}
							handlePresentModalPress={handlePresentModalPress}
						/>
						<AvailableRoomsSuggestions
							allRooms={allRooms}
							handlePresentModalPress={handlePresentModalPress}
						/>
						<AttributionLink />
					</>
				)}
			</View>
		</StyledBottomSheet>
	)
}

export default MapBottomSheet
