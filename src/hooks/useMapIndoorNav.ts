import { toast } from 'burnt'
import { selectionAsync } from 'expo-haptics'
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InteractionManager, Platform } from 'react-native'
import type {
	DetailSheetPickStartProps,
	MapPickStartSheetChrome
} from '@/components/Map/indoor-nav-start-sheet'
import {
	DETAIL_OPEN,
	DETAIL_PICK_START,
	DETAIL_PICK_START_SEARCH
} from '@/components/Map/sheet-detents'
import type { LucideIcon } from '@/components/Universal/icon'
import { MapContext } from '@/contexts/map'
import {
	EMPTY_INDOOR_MAP_LAYERS,
	type IndoorNavMapLayersData,
	isEmptyIndoorMapLayers
} from '@/hooks/indoor-nav-map-layers'
import { useFeatureFlagEnabled } from '@/hooks/useFeatureFlag'
import { useIndoorNavDataQuery } from '@/hooks/useIndoorNavDataQuery'
import { useIndoorNavigation } from '@/hooks/useIndoorNavigation'
import { useIndoorNavSteps } from '@/hooks/useIndoorNavSteps'
import { useMapNavStairsCamera } from '@/hooks/useMapNavStairsCamera'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import { useOutdoorNavRouterQuery } from '@/hooks/useOutdoorNavRouterQuery'
import {
	INDOOR_NAV_FLAG_KEY,
	isIndoorNavPreviewEnabled
} from '@/lib/indoor-nav-flag'
import type { ClickedMapElement, MapCoordinate } from '@/types/map'
import { SEARCH_TYPES } from '@/types/map'
import type { MaterialIcon } from '@/types/material-icons'
import {
	activeStairCodesForStep,
	entrancesGeoJsonForBuilding,
	entrancesGeoJsonForFloor,
	FLOORS,
	getIndoorBuildingForCode,
	getIndoorData,
	getIndoorGraph,
	getIndoorRoomFloorsForCode,
	ghostFloorsGeoJson,
	indoorNavLocaleFromLanguage,
	isIndoorDataLoaded,
	type JourneyStep,
	OUTDOOR_FLOOR,
	routeProgressGeoJsonForFloor,
	stairMomentFromStep,
	stairShaftsGeoJsonForFloor,
	stepMarkersGeoJsonForFloor
} from '@/utils/indoor-nav'
import { roomRouteNeedsOutdoorRouter } from '@/utils/indoor-nav/cross-building'
import {
	defaultStartForBuilding,
	entranceNodeId,
	INDOOR_DEFAULT_START_ID,
	roomNodeId
} from '@/utils/indoor-nav/ids'
import { formatEndpointLabel } from '@/utils/indoor-nav/start-endpoints'
import { pickStartMapElement } from '@/utils/map-pick-start-display'

interface UseMapIndoorNavOptions {
	clickedElement: ClickedMapElement | null
	overlayFloor: string
	allSections: MapScreenModel['allSections']
	hideDetailSheet: () => void
	presentDetailSheet: (index?: number) => void
	hideSearchSheet: () => void
	restoreSearchSheet: () => void
}

export type MapIndoorNavMode = NonNullable<
	ReturnType<typeof useMapIndoorNav>['navMode']
>

export function useMapIndoorNav({
	clickedElement,
	overlayFloor,
	allSections,
	hideDetailSheet,
	presentDetailSheet,
	hideSearchSheet,
	restoreSearchSheet
}: UseMapIndoorNavOptions) {
	const { t } = useTranslation('indoor-nav')
	const { i18n } = useTranslation()
	const { setClickedElement, setCurrentFloor } = use(MapContext)
	const preview = isIndoorNavPreviewEnabled()
	const { enabled: flagEnabled } = useFeatureFlagEnabled(
		INDOOR_NAV_FLAG_KEY,
		preview
	)
	const indoorNavEnabled = preview || flagEnabled
	const { isSuccess: indoorDataReady, data: indoorData } =
		useIndoorNavDataQuery(indoorNavEnabled)

	const [navActive, setNavActive] = useState(false)
	const [pickStartActive, setPickStartActive] = useState(false)
	const [startFromId, setStartFromId] = useState(INDOOR_DEFAULT_START_ID)
	const [pickStartMapSelection, setPickStartMapSelection] =
		useState<ClickedMapElement | null>(null)
	const [pickStartSession, setPickStartSession] = useState(0)
	const [pickStartSheetSearching, setPickStartSheetSearching] = useState(false)
	const navDestRef = useRef<string | null>(null)
	const [navStepIndex, setNavStepIndex] = useState(0)

	const destinationCode =
		clickedElement?.type === SEARCH_TYPES.ROOM ? clickedElement.data : null

	const needsOutdoorNavData = useMemo(() => {
		if (!indoorNavEnabled || !indoorDataReady) {
			return false
		}
		// Warm the footpath router while the user picks a start, so Start
		// never waits on a cold fetch + rebuild.
		if (navActive || pickStartActive || overlayFloor === OUTDOOR_FLOOR) {
			return true
		}
		if (destinationCode == null || !isIndoorDataLoaded()) {
			return false
		}
		return roomRouteNeedsOutdoorRouter(
			getIndoorGraph(),
			getIndoorData(),
			destinationCode,
			startFromId,
			overlayFloor
		)
	}, [
		destinationCode,
		indoorDataReady,
		indoorNavEnabled,
		navActive,
		overlayFloor,
		pickStartActive,
		startFromId
	])

	const { data: outdoorData } = useOutdoorNavRouterQuery(needsOutdoorNavData)
	const outdoorRouter = outdoorData?.router ?? null

	useEffect(() => {
		if (destinationCode == null) {
			return
		}
		const building = getIndoorBuildingForCode(destinationCode) ?? 'G'
		setStartFromId(defaultStartForBuilding(building))
		setPickStartActive(false)
		setPickStartMapSelection(null)
		setNavActive(false)
		navDestRef.current = null
	}, [destinationCode])

	const stepsSnapshotRef = useRef<{ steps: JourneyStep[]; stepIndex: number }>({
		steps: [],
		stepIndex: 0
	})

	const indoorNav = useIndoorNavigation({
		clickedElement,
		overlayFloor,
		lockedToId: navActive ? navDestRef.current : null,
		enabled: indoorNavEnabled && indoorDataReady,
		fullRoute: navActive,
		indoorData,
		fromId: startFromId,
		locale: indoorNavLocaleFromLanguage(i18n.language),
		outdoorRouter
	})

	const routeResultRef = useRef(indoorNav?.routeResult)
	routeResultRef.current = indoorNav?.routeResult

	const {
		stairsPhase,
		cutawayMoment,
		navCamera,
		onFocusStep,
		onNavCameraIdle,
		restoreDefaultMapView
	} = useMapNavStairsCamera({
		routeResultRef,
		stepsSnapshotRef
	})

	const indoorSteps = useIndoorNavSteps({
		indoorNav,
		viewFloor: overlayFloor,
		stepIndex: navStepIndex,
		setStepIndex: setNavStepIndex,
		navActive,
		onFocusStep
	})

	stepsSnapshotRef.current = {
		steps: indoorSteps.steps,
		stepIndex: indoorSteps.stepIndex
	}

	const selectStepRef = useRef(indoorSteps.selectStep)
	selectStepRef.current = indoorSteps.selectStep

	const routeFrameKey =
		navActive && indoorNav?.routeResult != null
			? `${indoorNav.fromId}:${indoorNav.toId}`
			: null

	useEffect(() => {
		if (routeFrameKey == null) {
			return
		}
		selectStepRef.current(0)
	}, [routeFrameKey])

	const onStairsCutaway = navActive && stairsPhase === 'cutaway'

	const navRouteResult = indoorNav?.routeResult ?? null

	const routeHasOutdoor = useMemo(
		() =>
			navRouteResult?.segments.some((s) => s.floor === OUTDOOR_FLOOR) ?? false,
		[navRouteResult]
	)

	const navFloors = useMemo(() => {
		if (!navActive || navRouteResult == null) {
			return null
		}
		const floors = [...new Set(navRouteResult.segments.map((s) => s.floor))]
		if (routeHasOutdoor) {
			return [...FLOORS, OUTDOOR_FLOOR]
		}
		return floors.filter((f) => f !== OUTDOOR_FLOOR)
	}, [navRouteResult, navActive, routeHasOutdoor])

	const mapSelectionForStartId = useCallback(
		(id: string, center?: MapCoordinate): ClickedMapElement | null => {
			if (!id.startsWith('room:')) {
				return null
			}
			const code = id.split(':')[2]
			if (code == null || code === '') {
				return null
			}
			return {
				type: SEARCH_TYPES.ROOM,
				data: code,
				center,
				manual: true
			}
		},
		[]
	)

	const pickStartFromEndpoint = useCallback(
		(id: string, mapHighlight?: ClickedMapElement | null) => {
			setStartFromId(id)
			const graph = getIndoorGraph()
			const node = graph.nodes.get(id)
			const floor =
				node?.floor === OUTDOOR_FLOOR ? 'EG' : String(node?.floor ?? 'EG')
			setCurrentFloor({ floor, manual: true })
			if (mapHighlight !== undefined) {
				setPickStartMapSelection(mapHighlight)
				return
			}
			setPickStartMapSelection(mapSelectionForStartId(id))
		},
		[mapSelectionForStartId, setCurrentFloor]
	)

	const pickStartFromEntranceRawId = useCallback(
		(rawId: string) => {
			pickStartFromEndpoint(entranceNodeId(rawId))
			if (Platform.OS === 'ios') {
				void selectionAsync()
			}
		},
		[pickStartFromEndpoint]
	)

	const indoorMapLayers = useMemo((): IndoorNavMapLayersData | null => {
		if (!indoorNavEnabled || !indoorDataReady) {
			return null
		}
		// Buildings have no room destination, so indoorNav stays null for
		// them — yet their mapped entrances are still worth previewing.
		const selectedBuilding =
			clickedElement?.type === SEARCH_TYPES.BUILDING
				? clickedElement.data
				: null
		if (indoorNav == null && selectedBuilding == null) {
			return null
		}
		const data = getIndoorData()
		const floor = overlayFloor
		if (!navActive) {
			let entrancesGeoJSON = entrancesGeoJsonForFloor(data, floor)
			if (pickStartActive) {
				entrancesGeoJSON = entrancesGeoJsonForFloor(data, 'EG')
			} else if (selectedBuilding != null) {
				entrancesGeoJSON = entrancesGeoJsonForBuilding(data, selectedBuilding)
			}
			const previewLayers: IndoorNavMapLayersData = {
				...EMPTY_INDOOR_MAP_LAYERS,
				entrancesGeoJSON
			}
			return isEmptyIndoorMapLayers(previewLayers) ? null : previewLayers
		}
		if (indoorNav == null) {
			return null
		}
		const routeResult = navRouteResult
		if (routeResult == null || indoorSteps.steps.length === 0) {
			return null
		}
		const activeStep = indoorSteps.steps[indoorSteps.stepIndex]
		const stairMoment = cutawayMoment ?? stairMomentFromStep(activeStep)
		const stairCodes = activeStairCodesForStep(
			routeResult,
			activeStep,
			floor,
			indoorSteps.steps,
			indoorSteps.stepIndex
		)
		const emptyFc = EMPTY_INDOOR_MAP_LAYERS.routeProgressGeoJSON
		const activeLayers: IndoorNavMapLayersData = {
			stairsGeoJSON: onStairsCutaway
				? EMPTY_INDOOR_MAP_LAYERS.stairsGeoJSON
				: stairShaftsGeoJsonForFloor(data, routeResult, floor, stairCodes),
			entrancesGeoJSON: EMPTY_INDOOR_MAP_LAYERS.entrancesGeoJSON,
			footpathsGeoJSON: EMPTY_INDOOR_MAP_LAYERS.footpathsGeoJSON,
			routeProgressGeoJSON: onStairsCutaway
				? emptyFc
				: routeProgressGeoJsonForFloor(
						indoorSteps.steps,
						indoorSteps.stepIndex,
						floor
					),
			stepMarkersGeoJSON: stepMarkersGeoJsonForFloor(
				routeResult,
				indoorSteps.steps,
				indoorSteps.stepIndex,
				floor
			),
			destinationRoomGeoJSON: EMPTY_INDOOR_MAP_LAYERS.destinationRoomGeoJSON,
			ghostFloorsGeoJSON: ghostFloorsGeoJson(data, stairMoment, floor),
			stairMoment
		}
		return isEmptyIndoorMapLayers(activeLayers) ? null : activeLayers
	}, [
		clickedElement,
		cutawayMoment,
		indoorDataReady,
		indoorNav?.toId,
		indoorNavEnabled,
		indoorSteps.stepIndex,
		indoorSteps.steps,
		navActive,
		navRouteResult,
		onStairsCutaway,
		overlayFloor,
		pickStartActive
	])

	const resetPickStartToDefault = useCallback(() => {
		if (destinationCode == null) {
			setStartFromId(INDOOR_DEFAULT_START_ID)
			setPickStartMapSelection(null)
			return
		}
		const building = getIndoorBuildingForCode(destinationCode) ?? 'G'
		const defaultId = defaultStartForBuilding(building)
		setStartFromId(defaultId)
		setPickStartMapSelection(mapSelectionForStartId(defaultId))
	}, [destinationCode, mapSelectionForStartId])

	const openPickStart = useCallback(() => {
		if (indoorNav == null) {
			return
		}
		resetPickStartToDefault()
		setPickStartSession((n) => n + 1)
		setPickStartSheetSearching(false)
		setPickStartActive(true)
		presentDetailSheet(DETAIL_PICK_START)
	}, [indoorNav, presentDetailSheet, resetPickStartToDefault])

	const leavePickStartUI = useCallback(() => {
		setPickStartActive(false)
		setPickStartSheetSearching(false)
		setPickStartMapSelection(null)
	}, [])

	const resetPickStartMode = useCallback(() => {
		leavePickStartUI()
		resetPickStartToDefault()
	}, [leavePickStartUI, resetPickStartToDefault])

	const cancelPickStart = useCallback(() => {
		resetPickStartMode()
		presentDetailSheet(DETAIL_OPEN)
	}, [presentDetailSheet, resetPickStartMode])

	const clearPickStart = resetPickStartMode

	const setPickStartSearching = useCallback(
		(searching: boolean) => {
			setPickStartSheetSearching(searching)
			if (!pickStartActive) {
				return
			}
			presentDetailSheet(
				searching ? DETAIL_PICK_START_SEARCH : DETAIL_PICK_START
			)
		},
		[pickStartActive, presentDetailSheet]
	)

	const confirmStartNavigation = useCallback(() => {
		if (indoorNav == null) {
			return
		}
		if (!indoorNav.routeReady) {
			toast({
				title: t('routeNotReadyTitle'),
				message: t('routeNotReadyMessage'),
				preset: 'error'
			})
			return
		}
		navDestRef.current = indoorNav.toId
		leavePickStartUI()
		hideDetailSheet()
		hideSearchSheet()
		// Let the sheet-dismiss animations run first — the full route,
		// journey steps and map layers all compute off this flag.
		InteractionManager.runAfterInteractions(() => {
			setNavActive(true)
		})
	}, [hideDetailSheet, hideSearchSheet, indoorNav, leavePickStartUI, t])

	const cancelIndoorNav = useCallback(() => {
		navDestRef.current = null
		setNavActive(false)
		clearPickStart()
		setNavStepIndex(0)
		setClickedElement(null)
		setCurrentFloor({ floor: 'EG', manual: false })
		restoreSearchSheet()
		restoreDefaultMapView()
	}, [
		clearPickStart,
		restoreDefaultMapView,
		restoreSearchSheet,
		setClickedElement,
		setCurrentFloor
	])

	useEffect(() => {
		if (
			navActive &&
			navDestRef.current != null &&
			indoorNav != null &&
			clickedElement?.data != null &&
			indoorNav.toId !== navDestRef.current
		) {
			navDestRef.current = null
			setNavActive(false)
			setNavStepIndex(0)
			restoreDefaultMapView()
		}
	}, [clickedElement?.data, indoorNav, navActive, restoreDefaultMapView])

	const startFromLabel = useMemo(() => {
		if (indoorNav == null) {
			return ''
		}
		return formatEndpointLabel(getIndoorGraph(), startFromId, t)
	}, [indoorNav, startFromId, t])

	const pickStartChrome = useMemo((): MapPickStartSheetChrome | null => {
		if (!pickStartActive || indoorNav == null) {
			return null
		}
		return {
			title: t('pickStartTitle'),
			subtitle: t('pickStartDestinationOnly', {
				destination: indoorNav.toLabel
			}),
			backAccessibilityLabel: t('pickStartBack'),
			onBack: cancelPickStart
		}
	}, [cancelPickStart, indoorNav, pickStartActive, t])

	const mergedSections = useMemo(() => {
		if (!indoorNavEnabled || indoorNav == null) {
			return allSections
		}
		return [
			{
				header: `${t('title')} · ${t('beta')}`,
				items: [
					{
						testID: 'map-indoor-nav-start',
						icon: {
							ios: 'figure.walk',
							android: 'directions_walk' as MaterialIcon,
							web: 'Navigation' as LucideIcon
						},
						title: t('start'),
						value: indoorNav.summary,
						accessibilityLabel: t('startA11y', {
							summary: indoorNav.summary
						}),
						onPress: () => {
							openPickStart()
						}
					}
				]
			},
			...allSections
		]
	}, [allSections, indoorNav, indoorNavEnabled, openPickStart, t])

	const navMode = useMemo(() => {
		if (
			!indoorNavEnabled ||
			!navActive ||
			indoorNav == null ||
			indoorSteps.copy == null
		) {
			return null
		}
		return {
			copy: indoorSteps.copy,
			floorBadge: indoorSteps.floorBadge,
			stepIndex: indoorSteps.stepIndex,
			stepTotal: indoorSteps.steps.length,
			backLabel: t('back'),
			endLabel: t('end'),
			selectStep: indoorSteps.selectStep,
			selectFloor: indoorSteps.selectFloor,
			cancel: cancelIndoorNav
		}
	}, [
		cancelIndoorNav,
		indoorNav,
		indoorNavEnabled,
		indoorSteps.copy,
		indoorSteps.floorBadge,
		indoorSteps.selectFloor,
		indoorSteps.selectStep,
		indoorSteps.stepIndex,
		indoorSteps.steps,
		navActive,
		t
	])

	const navShowGhostCutaway = navActive && stairsPhase === 'cutaway'

	const tryPickStartFromMapRoom = useCallback(
		(roomCode: string, floor: string, center?: MapCoordinate) => {
			if (!pickStartActive) {
				return false
			}
			const floors = getIndoorRoomFloorsForCode(roomCode)
			if (floors.length === 0) {
				return false
			}
			const effectiveFloor = floors.includes(floor) ? floor : floors[0]
			pickStartFromEndpoint(roomNodeId(effectiveFloor ?? 'EG', roomCode), {
				type: SEARCH_TYPES.ROOM,
				data: roomCode,
				center,
				manual: true
			})
			if (Platform.OS === 'ios') {
				void selectionAsync()
			}
			return true
		},
		[pickStartActive, pickStartFromEndpoint]
	)

	const detailPickStart = useMemo((): DetailSheetPickStartProps => {
		return {
			active: pickStartActive,
			searching: pickStartSheetSearching,
			chrome: pickStartChrome,
			session: pickStartSession,
			indoorDataReady,
			startFromId,
			startFromLabel,
			onSelectFrom: pickStartFromEndpoint,
			onConfirm: confirmStartNavigation,
			onSearchingChange: setPickStartSearching,
			onResetToDefault: resetPickStartToDefault
		}
	}, [
		confirmStartNavigation,
		indoorDataReady,
		pickStartActive,
		pickStartChrome,
		pickStartFromEndpoint,
		pickStartSession,
		pickStartSheetSearching,
		resetPickStartToDefault,
		setPickStartSearching,
		startFromId,
		startFromLabel
	])

	const onPickStartEntrancePress = pickStartActive
		? pickStartFromEntranceRawId
		: undefined

	const pickStartMapPin = useMemo(
		() =>
			pickStartMapElement(
				pickStartActive,
				destinationCode,
				startFromId,
				pickStartMapSelection
			),
		[destinationCode, pickStartActive, pickStartMapSelection, startFromId]
	)

	return {
		indoorNav: indoorNavEnabled ? indoorNav : null,
		indoorMapLayers,
		navMode,
		navFloors,
		navCameraRequestId: navActive ? navCamera.id : 0,
		navCameraCommand: navActive ? navCamera.command : null,
		onNavCameraIdle,
		navShowGhostCutaway,
		navFloorPlanDimmed: navShowGhostCutaway,
		suppressSelectionCameraFocus: navActive,
		pickStartActive,
		pickStartMapPin,
		detailPickStart,
		onPickStartEntrancePress,
		tryPickStartFromMapRoom,
		clearPickStart,
		mergedSections
	}
}
