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
import { BottomSheet } from '@/components/Universal/bottom-sheet'
import { useSheetPosition } from '@/components/Universal/use-sheet-position'
import { MapContext } from '@/contexts/map'
import type { SelectMapElement } from '@/types/map'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import AttributionLink from './attribution-link'
import AvailableRoomsSuggestions from './available-rooms-suggestions'
import BottomSheetBackground from './bottom-sheet-background'
import { MapSheetHandle } from './map-sheet-handle'
import NextLectureSuggestion from './next-lecture-suggestion'
import SearchHistory from './search-history'
import SearchResults from './search-results'
import { sheetHostStyle } from './sheet-chrome'
import { SEARCH_FULL, SEARCH_HALF } from './sheet-detents'

interface MapBottomSheetProps {
	index: number
	onIndexChange: (index: number) => void
	detents: number[]
	currentPosition: SharedValue<number>
	allRooms: FeatureCollection
	selectMapElement: SelectMapElement
}

const MapBottomSheet = ({
	index,
	onIndexChange,
	detents,
	currentPosition,
	allRooms,
	selectMapElement
}: MapBottomSheetProps): React.JSX.Element => {
	const { theme } = useUniwind()
	const isDark = theme === 'dark'
	const { t } = useTranslation('common')
	const { localSearch, setLocalSearch, searchHistory } = use(MapContext)
	const labelColor = toColor(useCSSVariable('--color-label'))
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
	const sheetPosition = useSheetPosition(currentPosition)

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
		<BottomSheet
			index={index}
			detents={detents}
			animateIn={false}
			surface={<BottomSheetBackground />}
			onIndexChange={(nextIndex) => {
				onIndexChange(nextIndex)
				if (nextIndex <= SEARCH_HALF) {
					if (localSearch !== '') {
						setLocalSearch('')
					}
					textInputRef.current?.blur()
				}
			}}
			style={sheetHostStyle}
			{...sheetPosition}
		>
			<MapSheetHandle />
			<View className="px-page">
				<View className="flex-row h-10 mb-2.5 mt-1">
					<TextInput
						testID="map-search-input"
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
							onIndexChange(SEARCH_FULL)
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
							testID="map-search-cancel"
							onPress={() => {
								setLocalSearch('')
								textInputRef.current?.blur()
								onIndexChange(SEARCH_HALF)
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
					<SearchHistory selectMapElement={selectMapElement} />
				)}

				{searchFocused && localSearch === '' && (
					<Text className="text-label text-base pt-[60px] py-[30px] text-center">
						{t('pages.map.search.placeholder')}
					</Text>
				)}

				{localSearch !== '' ? (
					<SearchResults
						selectMapElement={selectMapElement}
						allRooms={allRooms}
					/>
				) : searchFocused ? null : (
					<>
						<NextLectureSuggestion
							allRooms={allRooms}
							selectMapElement={selectMapElement}
						/>
						<AvailableRoomsSuggestions
							allRooms={allRooms}
							selectMapElement={selectMapElement}
						/>
						<AttributionLink />
					</>
				)}
			</View>
		</BottomSheet>
	)
}

export default MapBottomSheet
