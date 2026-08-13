import type React from 'react'
import { View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import { BottomSheetDetailModal } from '@/components/Map/bottom-sheet-detail-modal'
import MapBottomSheet from '@/components/Map/bottom-sheet-map'
import FloorPicker from '@/components/Map/floor-picker'
import WebMapCanvas from '@/components/Map/map-canvas.web'
import { OsmCopyright } from '@/components/Map/osm-copyright'
import { useMapScreenChrome } from '@/hooks/useMapScreenChrome'
import { LoadingState } from '@/utils/ui-utils'
import LoadingIndicator from '../Universal/loading-indicator'

const MapScreen = (): React.JSX.Element => {
	const {
		t,
		mapLoadState,
		setMapLoadState,
		mapMode,
		primaryColor,
		selectionColor,
		labelColor,
		backgroundColor,
		searchDetents,
		detailDetents,
		searchIndex,
		setSearchIndex,
		currentPosition,
		currentPositionModal,
		showAllFloors,
		toggleShowAllFloors,
		onRegionChange,
		animatedStyles,
		mapCenter,
		overlayError,
		allRooms,
		buildingGeoJSON,
		uniqueEtages,
		filteredGeoJSON,
		availableFilteredGeoJSON,
		clickedElement,
		currentFloor,
		selectMapElement,
		roomData,
		allSections,
		detailIndex,
		handleDetailIndexChange,
		cameraResetRequestId,
		focusPaddingBottom
	} = useMapScreenChrome()

	return (
		<View testID="map-screen" className="flex-1">
			{mapLoadState === LoadingState.ERROR && (
				<View
					className="flex-1 h-full justify-center absolute w-full z-[100]"
					style={{ backgroundColor }}
				>
					<ErrorView title={t('error.map.mapLoadError')} />
				</View>
			)}
			{mapLoadState === LoadingState.LOADING && (
				<View
					className="flex-1 h-full justify-center absolute w-full z-[100]"
					style={{ backgroundColor }}
				>
					<LoadingIndicator />
				</View>
			)}
			<WebMapCanvas
				setMapLoadState={setMapLoadState}
				mapLoadState={mapLoadState}
				cameraResetRequestId={cameraResetRequestId}
				mapCenter={mapCenter}
				filteredGeoJSON={filteredGeoJSON}
				availableFilteredGeoJSON={availableFilteredGeoJSON}
				buildingGeoJSON={buildingGeoJSON}
				clickedElement={clickedElement}
				selectMapElement={selectMapElement}
				mapMode={mapMode}
				primaryColor={primaryColor}
				selectionColor={selectionColor}
				labelColor={labelColor}
				backgroundColor={backgroundColor}
				onRegionChange={onRegionChange}
				focusPaddingBottom={focusPaddingBottom}
				overlayFloor={currentFloor?.floor ?? 'EG'}
			/>
			{overlayError === null && (
				<FloorPicker
					floors={uniqueEtages}
					showAllFloors={showAllFloors}
					toggleShowAllFloors={toggleShowAllFloors}
				/>
			)}
			{mapLoadState === LoadingState.LOADED && (
				<OsmCopyright style={animatedStyles} />
			)}
			<MapBottomSheet
				index={searchIndex}
				onIndexChange={setSearchIndex}
				detents={searchDetents}
				currentPosition={currentPosition}
				allRooms={allRooms}
				selectMapElement={selectMapElement}
			/>
			<BottomSheetDetailModal
				index={detailIndex}
				onIndexChange={handleDetailIndexChange}
				detents={detailDetents}
				currentPositionModal={currentPositionModal}
				roomData={roomData}
				modalSection={allSections}
			/>
		</View>
	)
}

export default MapScreen
