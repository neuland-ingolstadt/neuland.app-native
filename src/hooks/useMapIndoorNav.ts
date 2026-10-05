import {
	createElement,
	use,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { IndoorNavBetaLabel } from '@/components/Map/indoor-nav-beta-label'
import type { LucideIcon } from '@/components/Universal/icon'
import { MapContext } from '@/contexts/map'
import {
	EMPTY_INDOOR_MAP_LAYERS,
	type IndoorNavMapLayersData
} from '@/hooks/indoor-nav-map-layers'
import { useFeatureFlagEnabled } from '@/hooks/useFeatureFlag'
import { useIndoorNavDataQuery } from '@/hooks/useIndoorNavDataQuery'
import { useIndoorNavigation } from '@/hooks/useIndoorNavigation'
import {
	boundsForJourneyStep,
	STEP_FIT_MARGIN_M
} from '@/hooks/useIndoorNavStepFocus'
import { useIndoorNavSteps } from '@/hooks/useIndoorNavSteps'
import type { MapScreenModel } from '@/hooks/useMapScreenModel'
import {
	INDOOR_NAV_FLAG_KEY,
	isIndoorNavPreviewEnabled
} from '@/lib/indoor-nav-flag'
import type { ClickedMapElement } from '@/types/map'
import type { MaterialIcon } from '@/types/material-icons'
import {
	activeStairCodesForStep,
	bboxOfCoords,
	entrancesGeoJsonForFloor,
	getIndoorData,
	ghostFloorsGeoJson,
	indoorNavLocaleFromLanguage,
	type JourneyStep,
	type LonLat,
	type NavCameraCommand,
	type NavStairsPhase,
	routeProgressGeoJsonForFloor,
	type StairMoment,
	stairMomentFromStep,
	stairShaftsGeoJsonForFloor,
	stepMarkersGeoJsonForFloor
} from '@/utils/indoor-nav'

interface UseMapIndoorNavOptions {
	clickedElement: ClickedMapElement | null
	overlayFloor: string
	allSections: MapScreenModel['allSections']
	hideDetailSheet: () => void
	setSearchIndex: (index: number) => void
	searchHiddenIndex: number
	searchHalfIndex: number
}

export type MapIndoorNavMode = NonNullable<
	ReturnType<typeof useMapIndoorNav>['navMode']
>

export function useMapIndoorNav({
	clickedElement,
	overlayFloor,
	allSections,
	hideDetailSheet,
	setSearchIndex,
	searchHiddenIndex,
	searchHalfIndex
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
	const navDestRef = useRef<string | null>(null)
	const [navStepIndex, setNavStepIndex] = useState(0)

	const [stairsPhase, setStairsPhase] = useState<NavStairsPhase>('idle')
	const stairsPhaseRef = useRef<NavStairsPhase>('idle')
	const syncStairsPhase = useCallback((phase: NavStairsPhase) => {
		stairsPhaseRef.current = phase
		setStairsPhase(phase)
	}, [])

	const [cutawayMoment, setCutawayMoment] = useState<StairMoment | null>(null)
	const [navCamera, setNavCamera] = useState<{
		id: number
		command: NavCameraCommand | null
	}>({ id: 0, command: null })
	const stepsSnapshotRef = useRef<{ steps: JourneyStep[]; stepIndex: number }>({
		steps: [],
		stepIndex: 0
	})
	const exitStairsCameraPendingRef = useRef(false)

	const bumpNavCamera = useCallback((command: NavCameraCommand) => {
		setNavCamera((previous) => ({
			id: previous.id + 1,
			command
		}))
	}, [])

	const indoorNav = useIndoorNavigation({
		clickedElement,
		overlayFloor,
		lockedToId: navActive ? navDestRef.current : null,
		enabled: indoorNavEnabled && indoorDataReady,
		fullRoute: navActive,
		indoorData,
		locale: indoorNavLocaleFromLanguage(i18n.language)
	})

	const routeResultRef = useRef(indoorNav?.routeResult)
	routeResultRef.current = indoorNav?.routeResult

	const onFocusStep = useCallback(
		(step: JourneyStep, ctx?: { leftStairsAt?: LonLat }) => {
			const routeResult = routeResultRef.current
			if (step.kind === 'stairs') {
				syncStairsPhase('entering')
				setCutawayMoment(null)
				bumpNavCamera({ kind: 'stair-enter', at: step.change.at })
				return
			}
			if (step.kind === 'arrival') {
				syncStairsPhase('flat')
				setCutawayMoment(null)
				return
			}
			const wasInStairsCamera =
				stairsPhaseRef.current === 'entering' ||
				stairsPhaseRef.current === 'cutaway'
			const bounds =
				boundsForJourneyStep(step, routeResult ?? null) ??
				(ctx?.leftStairsAt != null
					? bboxOfCoords([ctx.leftStairsAt], STEP_FIT_MARGIN_M)
					: null)
			if (bounds == null) {
				return
			}
			const resetFromStairs = wasInStairsCamera || ctx?.leftStairsAt != null
			if (resetFromStairs) {
				exitStairsCameraPendingRef.current = true
			} else {
				syncStairsPhase('flat')
				setCutawayMoment(null)
			}
			bumpNavCamera({
				kind: 'leg-bounds',
				bounds,
				resetFromStairs
			})
		},
		[bumpNavCamera, syncStairsPhase]
	)

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

	const onNavCameraIdle = useCallback(() => {
		const phase = stairsPhaseRef.current
		if (phase === 'entering') {
			syncStairsPhase('cutaway')
			const { steps, stepIndex } = stepsSnapshotRef.current
			const step = steps[stepIndex]
			setCutawayMoment(stairMomentFromStep(step))
			return
		}
		if (exitStairsCameraPendingRef.current) {
			exitStairsCameraPendingRef.current = false
			syncStairsPhase('flat')
			setCutawayMoment(null)
		}
	}, [syncStairsPhase])

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

	const indoorMapLayers = useMemo((): IndoorNavMapLayersData | null => {
		if (!indoorNavEnabled || !indoorDataReady || indoorNav == null) {
			return null
		}
		const data = getIndoorData()
		const floor = overlayFloor
		if (!navActive) {
			return {
				...EMPTY_INDOOR_MAP_LAYERS,
				entrancesGeoJSON: entrancesGeoJsonForFloor(data, floor)
			}
		}
		const routeResult = indoorNav.routeResult
		if (routeResult == null || indoorSteps.steps.length === 0) {
			return EMPTY_INDOOR_MAP_LAYERS
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
		return {
			stairsGeoJSON: onStairsCutaway
				? EMPTY_INDOOR_MAP_LAYERS.stairsGeoJSON
				: stairShaftsGeoJsonForFloor(data, routeResult, floor, stairCodes),
			entrancesGeoJSON: EMPTY_INDOOR_MAP_LAYERS.entrancesGeoJSON,
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
	}, [
		cutawayMoment,
		indoorDataReady,
		indoorNav,
		indoorNavEnabled,
		indoorSteps.stepIndex,
		indoorSteps.steps,
		navActive,
		onStairsCutaway,
		overlayFloor
	])

	const startIndoorNav = useCallback(() => {
		if (indoorNav == null) {
			return
		}
		navDestRef.current = indoorNav.toId
		hideDetailSheet()
		setSearchIndex(searchHiddenIndex)
		setNavActive(true)
	}, [hideDetailSheet, indoorNav, searchHiddenIndex, setSearchIndex])

	const restoreDefaultMapView = useCallback(() => {
		exitStairsCameraPendingRef.current = false
		syncStairsPhase('idle')
		setCutawayMoment(null)
		setNavCamera({ id: 0, command: null })
	}, [syncStairsPhase])

	const cancelIndoorNav = useCallback(() => {
		navDestRef.current = null
		setNavActive(false)
		setNavStepIndex(0)
		setClickedElement(null)
		setCurrentFloor({ floor: 'EG', manual: false })
		setSearchIndex(searchHalfIndex)
		restoreDefaultMapView()
	}, [
		restoreDefaultMapView,
		searchHalfIndex,
		setClickedElement,
		setCurrentFloor,
		setSearchIndex
	])

	useEffect(() => {
		if (
			navActive &&
			navDestRef.current != null &&
			clickedElement?.data != null &&
			indoorNav?.toId !== navDestRef.current
		) {
			navDestRef.current = null
			setNavActive(false)
			setNavStepIndex(0)
			restoreDefaultMapView()
		}
	}, [clickedElement?.data, indoorNav?.toId, navActive, restoreDefaultMapView])

	const mergedSections = useMemo(() => {
		if (!indoorNavEnabled || indoorNav == null) {
			return allSections
		}
		return [
			{
				header: t('title'),
				items: [
					{
						testID: 'map-indoor-nav-start',
						icon: {
							ios: 'figure.walk',
							android: 'directions_walk' as MaterialIcon,
							web: 'Navigation' as LucideIcon
						},
						titleContent: createElement(IndoorNavBetaLabel, {
							label: t('beta')
						}),
						value: indoorNav.summary,
						accessibilityLabel: t('startA11y', {
							summary: indoorNav.summary
						}),
						onPress: () => {
							startIndoorNav()
						}
					}
				]
			},
			...allSections
		]
	}, [allSections, indoorNav, indoorNavEnabled, startIndoorNav, t])

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

	return {
		indoorNav: indoorNavEnabled ? indoorNav : null,
		indoorMapLayers,
		navMode,
		navCameraRequestId: navActive ? navCamera.id : 0,
		navCameraCommand: navActive ? navCamera.command : null,
		onNavCameraIdle,
		navShowGhostCutaway,
		navFloorPlanDimmed: navShowGhostCutaway,
		suppressSelectionCameraFocus: navActive,
		mergedSections
	}
}
