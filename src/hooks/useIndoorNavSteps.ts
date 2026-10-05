import { use, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContext } from '@/contexts/map'
import {
	buildJourneySteps,
	getIndoorGraph,
	indoorNavLocaleFromLanguage,
	type JourneyStep,
	type JourneyStepCopy,
	journeyStepCopy,
	type LonLat,
	mapLegForStep,
	pickLegForFloor
} from '@/utils/indoor-nav'
import type { IndoorNavModel } from './useIndoorNavigation'

export interface IndoorNavSteps {
	steps: JourneyStep[]
	stepIndex: number
	mapLeg: number
	copy: JourneyStepCopy | null
	floorBadge: string
	selectStep: (index: number) => void
	selectFloor: (floor: string) => void
}

interface UseIndoorNavStepsOptions {
	indoorNav: IndoorNavModel | null
	viewFloor: string
	stepIndex: number
	setStepIndex: (index: number) => void
	navActive: boolean
	/** Called with the leg coords to frame whenever the step changes. */
	onFocusStep?: (coords: LonLat[]) => void
}

function stepFloor(step: JourneyStep): string {
	if (step.kind === 'stairs') {
		return step.fromFloor
	}
	if (step.kind === 'arrival') {
		return step.floor
	}
	return step.segment.floor
}

/** Step-by-step journey state — mirrors indoor-nav/g route page logic. */
export function useIndoorNavSteps({
	indoorNav,
	viewFloor,
	stepIndex,
	setStepIndex,
	navActive,
	onFocusStep
}: UseIndoorNavStepsOptions): IndoorNavSteps {
	const { currentFloor, setCurrentFloor } = use(MapContext)
	const { t } = useTranslation('indoor-nav')
	const { i18n } = useTranslation()
	const locale = indoorNavLocaleFromLanguage(i18n.language)

	const routeResult = navActive ? indoorNav?.routeResult : null
	const steps = useMemo(() => {
		if (routeResult == null) {
			return []
		}
		return buildJourneySteps(routeResult)
	}, [routeResult])
	const destKey =
		indoorNav == null
			? null
			: `${indoorNav.destinationFloor}:${indoorNav.destinationCode}`

	useEffect(() => {
		setStepIndex(0)
	}, [destKey, setStepIndex])

	const safeStep = steps.length > 0 ? Math.min(stepIndex, steps.length - 1) : 0
	const currentStep = steps[safeStep]
	const mapLeg = mapLegForStep(currentStep)

	const applyStepView = useCallback(
		(s: JourneyStep) => {
			if (routeResult == null) {
				return
			}
			const floor = stepFloor(s)
			if (currentFloor?.floor !== floor) {
				setCurrentFloor({ floor, manual: true })
			}
			if (s.kind === 'stairs') {
				onFocusStep?.([s.change.at])
				return
			}
			if (s.kind === 'walk' && s.phase != null) {
				onFocusStep?.(s.segment.coords)
				return
			}
			onFocusStep?.(routeResult.segments[s.legIndex]?.coords ?? [])
		},
		[currentFloor?.floor, onFocusStep, routeResult, setCurrentFloor]
	)

	const selectStep = useCallback(
		(next: number) => {
			if (steps.length === 0) {
				return
			}
			const i = Math.max(0, Math.min(next, steps.length - 1))
			if (i === safeStep) {
				const s = steps[i]
				if (s != null) {
					applyStepView(s)
				}
				return
			}
			setStepIndex(i)
			const s = steps[i]
			if (s == null) {
				return
			}
			applyStepView(s)
		},
		[applyStepView, safeStep, setStepIndex, steps]
	)

	const selectFloor = useCallback(
		(floor: string) => {
			if (routeResult == null || routeResult.segments.length === 0) {
				if (currentFloor?.floor !== floor) {
					setCurrentFloor({ floor, manual: true })
				}
				return
			}
			const leg = pickLegForFloor(routeResult, floor, mapLeg)
			const idx = steps.findIndex(
				(s) => s.kind === 'walk' && s.legIndex === leg
			)
			if (idx >= 0) {
				selectStep(idx)
			} else if (currentFloor?.floor !== floor) {
				setCurrentFloor({ floor, manual: true })
			}
		},
		[
			currentFloor?.floor,
			mapLeg,
			routeResult,
			selectStep,
			setCurrentFloor,
			steps
		]
	)

	const copy = useMemo(() => {
		if (
			!navActive ||
			indoorNav == null ||
			routeResult == null ||
			steps.length === 0
		) {
			return null
		}
		return journeyStepCopy(
			getIndoorGraph(),
			indoorNav.fromId,
			indoorNav.toId,
			indoorNav.toLabel,
			routeResult,
			steps,
			safeStep,
			viewFloor,
			t,
			locale
		)
	}, [indoorNav, locale, navActive, routeResult, safeStep, steps, t, viewFloor])

	const floorBadge =
		!navActive || currentStep == null
			? ''
			: currentStep.kind === 'stairs'
				? `${currentStep.fromFloor} → ${currentStep.toFloor}`
				: currentStep.floor

	return {
		steps,
		stepIndex: safeStep,
		mapLeg,
		copy,
		floorBadge,
		selectStep,
		selectFloor
	}
}
