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
	destinationRoomGeoJsonForFloor,
	entrancesGeoJsonForFloor,
	type FitBounds,
	getIndoorData,
	indoorNavLocaleFromLanguage,
	type LonLat,
	routeProgressGeoJsonForFloor,
	stairShaftsGeoJsonForFloor,
	stepMarkersGeoJsonForFloor
} from '@/utils/indoor-nav'

/** Breathing room around the framed leg so close-ups don't feel cramped. */
const STEP_FIT_MARGIN_M = 8

interface UseMapIndoorNavOptions {
	clickedElement: ClickedMapElement | null
	overlayFloor: string
	allSections: MapScreenModel['allSections']
	hideDetailSheet: () => void
	requestCameraReset: () => void
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
	requestCameraReset,
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
	const [navFit, setNavFit] = useState<{
		id: number
		bounds: FitBounds | null
	}>({ id: 0, bounds: null })
	const [navStepIndex, setNavStepIndex] = useState(0)

	const indoorNav = useIndoorNavigation({
		clickedElement,
		overlayFloor,
		lockedToId: navActive ? navDestRef.current : null,
		enabled: indoorNavEnabled && indoorDataReady,
		fullRoute: navActive,
		indoorData,
		locale: indoorNavLocaleFromLanguage(i18n.language)
	})

	const indoorSteps = useIndoorNavSteps({
		indoorNav,
		viewFloor: overlayFloor,
		stepIndex: navStepIndex,
		setStepIndex: setNavStepIndex,
		navActive,
		onFocusStep: (coords: LonLat[]) => {
			const bounds = bboxOfCoords(coords, STEP_FIT_MARGIN_M)
			if (bounds == null) {
				return
			}
			setNavFit((previous) => ({ id: previous.id + 1, bounds }))
		}
	})

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
		const arriving =
			activeStep?.kind === 'arrival' && activeStep.floor === floor
		const stairCodes = activeStairCodesForStep(
			routeResult,
			activeStep,
			floor,
			indoorSteps.steps,
			indoorSteps.stepIndex
		)
		return {
			stairsGeoJSON: stairShaftsGeoJsonForFloor(
				data,
				routeResult,
				floor,
				stairCodes
			),
			entrancesGeoJSON: EMPTY_INDOOR_MAP_LAYERS.entrancesGeoJSON,
			routeProgressGeoJSON: routeProgressGeoJsonForFloor(
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
			destinationRoomGeoJSON: destinationRoomGeoJsonForFloor(
				data,
				floor,
				indoorNav.destinationCode,
				arriving
			)
		}
	}, [
		indoorDataReady,
		indoorNav,
		indoorNavEnabled,
		indoorSteps.stepIndex,
		indoorSteps.steps,
		navActive,
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
		setNavFit({ id: 0, bounds: null })
		requestCameraReset()
	}, [requestCameraReset])

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

	return {
		indoorNav: indoorNavEnabled ? indoorNav : null,
		indoorMapLayers,
		navMode,
		navFitRequestId: navActive ? navFit.id : 0,
		navFitBounds: navActive ? navFit.bounds : null,
		suppressSelectionCameraFocus: navActive,
		mergedSections
	}
}
