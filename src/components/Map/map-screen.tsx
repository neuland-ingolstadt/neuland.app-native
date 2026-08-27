import { LocationManager } from '@maplibre/maplibre-react-native'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import { BottomSheetDetailModal } from '@/components/Map/bottom-sheet-detail-modal'
import MapBottomSheet from '@/components/Map/bottom-sheet-map'
import FloorPicker from '@/components/Map/floor-picker'
import NativeMapCanvas from '@/components/Map/map-canvas.native'
import { OsmCopyright } from '@/components/Map/osm-copyright'
import { DETAIL_HIDDEN } from '@/components/Map/sheet-detents'
import { useMapScreenChrome } from '@/hooks/useMapScreenChrome'
import { LoadingState } from '@/utils/ui-utils'
import LoadingIndicator from '../Universal/loading-indicator'

const MapScreen = (): React.JSX.Element => {
	const [mapKey, setMapKey] = useState(0)
	const [disableFollowUser, setDisableFollowUser] = useState(false)
	const [locationPermissionGranted, setLocationPermissionGranted] =
		useState(false)
	const [locationRequestId, setLocationRequestId] = useState(0)

	const handleTabPress = useCallback(() => {
		setDisableFollowUser(true)
	}, [])

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
	} = useMapScreenChrome({ onTabPress: handleTabPress })

	useEffect(() => {
		let cancelled = false
		void LocationManager.requestPermissions()
			.then((granted) => {
				if (!cancelled) {
					setLocationPermissionGranted(granted)
				}
			})
			.catch(() => {
				if (!cancelled) {
					setLocationPermissionGranted(false)
				}
			})

		return () => {
			cancelled = true
		}
	}, [])

	useEffect(() => {
		if (clickedElement !== null) {
			setDisableFollowUser(true)
		}
	}, [clickedElement])

	const handleLocate = useCallback(() => {
		if (!locationPermissionGranted) {
			return
		}
		setDisableFollowUser(false)
		setLocationRequestId((previous) => previous + 1)
		handleDetailIndexChange(DETAIL_HIDDEN)
	}, [handleDetailIndexChange, locationPermissionGranted])

	const handleRefresh = useCallback(() => {
		setMapLoadState(LoadingState.LOADING)
		setMapKey((prev) => prev + 1)
	}, [setMapLoadState])

	return (
		<View testID="map-screen" className="flex-1">
			{mapLoadState === LoadingState.ERROR && (
				<View
					className="flex-1 h-full justify-center absolute w-full z-[100]"
					style={{ backgroundColor }}
				>
					<ErrorView
						title={t('error.map.mapLoadError')}
						onButtonPress={handleRefresh}
					/>
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

			<View testID="map-canvas" className="flex-1">
				<NativeMapCanvas
					mapKey={mapKey}
					cameraResetRequestId={cameraResetRequestId}
					mapLoadState={mapLoadState}
					setMapLoadState={setMapLoadState}
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
					locationPermissionGranted={locationPermissionGranted}
					locationRequestId={locationRequestId}
					disableFollowUser={disableFollowUser}
					onRegionChange={onRegionChange}
					focusPaddingBottom={focusPaddingBottom}
					overlayFloor={currentFloor?.floor ?? 'EG'}
				/>
				{overlayError === null && (
					<FloorPicker
						floors={uniqueEtages}
						showAllFloors={showAllFloors}
						toggleShowAllFloors={toggleShowAllFloors}
						locationPermissionGranted={locationPermissionGranted}
						onLocate={handleLocate}
					/>
				)}
			</View>

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
