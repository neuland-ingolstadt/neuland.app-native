import { router, useLocalSearchParams } from 'expo-router'
import type { FeatureCollection } from 'geojson'
import React, { use, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, Text, type TextInput, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { BottomSheet, type Detent } from '@/components/Universal/bottom-sheet'
import { useSheetPosition } from '@/components/Universal/use-sheet-position'
import { MapContext } from '@/contexts/map'
import type { SelectMapElement } from '@/types/map'
import AttributionLink from './attribution-link'
import AvailableRoomsSuggestions from './available-rooms-suggestions'
import BottomSheetBackground from './bottom-sheet-background'
import { MapSearchBar } from './map-search-bar'
import { MapSheetHandle } from './map-sheet-handle'
import NextLectureSuggestion from './next-lecture-suggestion'
import SearchHistory from './search-history'
import SearchResults from './search-results'
import { sheetHostStyle } from './sheet-chrome'
import { SEARCH_FULL, SEARCH_HALF } from './sheet-detents'

interface MapBottomSheetProps {
	index: number
	onIndexChange: (index: number) => void
	detents: Detent[]
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
	const { t } = useTranslation('common')
	const { searchHistory } = use(MapContext)
	const params = useLocalSearchParams<{ room: string }>()
	const sheetPosition = useSheetPosition(currentPosition)
	const textInputRef = useRef<TextInput>(null)
	const [searchQuery, setSearchQuery] = React.useState('')
	const [searchFocused, setSearchFocused] = React.useState(false)

	const clearSearch = useCallback((): void => {
		setSearchQuery('')
	}, [])

	const handleSearchChange = (text: string): void => {
		setSearchQuery(text)
		if (params.room != null && params.room !== '') {
			router.setParams(undefined)
		}
	}

	React.useEffect(() => {
		if (index > SEARCH_HALF) {
			return
		}
		textInputRef.current?.blur()
		Keyboard.dismiss()
		if (searchQuery !== '') {
			setSearchQuery('')
		}
	}, [index, searchQuery])

	return (
		<BottomSheet
			index={index}
			detents={detents}
			animateIn={false}
			surface={<BottomSheetBackground />}
			onIndexChange={onIndexChange}
			style={sheetHostStyle}
			{...sheetPosition}
		>
			<MapSheetHandle />
			<View className="px-page">
				<MapSearchBar
					value={searchQuery}
					onChangeText={handleSearchChange}
					onFocus={() => {
						onIndexChange(SEARCH_FULL)
					}}
					onCancel={() => {
						clearSearch()
						textInputRef.current?.blur()
						onIndexChange(SEARCH_HALF)
					}}
					onFocusChange={setSearchFocused}
					inputRef={textInputRef}
				/>

				{searchFocused && searchQuery === '' && searchHistory.length !== 0 && (
					<SearchHistory
						selectMapElement={selectMapElement}
						onClearSearch={clearSearch}
					/>
				)}

				{searchFocused && searchQuery === '' && (
					<Text className="text-label text-base pt-[60px] py-[30px] text-center">
						{t('pages.map.search.placeholder')}
					</Text>
				)}

				{searchQuery !== '' ? (
					<SearchResults
						selectMapElement={selectMapElement}
						allRooms={allRooms}
						searchQuery={searchQuery}
						onClearSearch={clearSearch}
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
