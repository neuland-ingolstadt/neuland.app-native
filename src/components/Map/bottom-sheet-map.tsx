import type { FeatureCollection } from 'geojson'
import React, { use, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, type TextInput, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { BottomSheet } from '@/components/Universal/bottom-sheet'
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
	const { t } = useTranslation('common')
	const { localSearch, setLocalSearch, searchHistory } = use(MapContext)
	const sheetPosition = useSheetPosition(currentPosition)
	const textInputRef = useRef<TextInput>(null)
	const [searchFocused, setSearchFocused] = React.useState(false)

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
				<MapSearchBar
					value={localSearch}
					onChangeText={setLocalSearch}
					onFocus={() => {
						onIndexChange(SEARCH_FULL)
					}}
					onCancel={() => {
						setLocalSearch('')
						textInputRef.current?.blur()
						onIndexChange(SEARCH_HALF)
					}}
					onFocusChange={setSearchFocused}
					inputRef={textInputRef}
				/>

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
