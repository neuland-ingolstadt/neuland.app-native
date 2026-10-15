import {
	type RefObject,
	useCallback,
	useReducer,
	useRef,
	useState
} from 'react'
import {
	boundsForJourneyStep,
	STEP_FIT_MARGIN_M
} from '@/hooks/useIndoorNavStepFocus'
import type {
	JourneyStep,
	LonLat,
	NavCameraCommand,
	NavStairsPhase
} from '@/utils/indoor-nav'
import { bboxOfCoords } from '@/utils/indoor-nav/geometry'
import {
	type StairMoment,
	stairMomentFromStep
} from '@/utils/indoor-nav/ghost-floors'
import type { RouteResult } from '@/utils/indoor-nav/types'

interface StairsCameraState {
	phase: NavStairsPhase
	cutawayMoment: StairMoment | null
	pendingFlatAfterLeg: boolean
}

const initialStairsCameraState: StairsCameraState = {
	phase: 'idle',
	cutawayMoment: null,
	pendingFlatAfterLeg: false
}

type StairsCameraAction =
	| { type: 'reset' }
	| { type: 'focus-stairs' }
	| { type: 'focus-arrival' }
	| { type: 'focus-walk'; afterStairs: boolean }
	| { type: 'camera-idle'; moment: StairMoment | null }

function stairsCameraReducer(
	state: StairsCameraState,
	action: StairsCameraAction
): StairsCameraState {
	switch (action.type) {
		case 'reset':
			return initialStairsCameraState
		case 'focus-stairs':
			return {
				phase: 'entering',
				cutawayMoment: null,
				pendingFlatAfterLeg: false
			}
		case 'focus-arrival':
			return {
				phase: 'flat',
				cutawayMoment: null,
				pendingFlatAfterLeg: false
			}
		case 'focus-walk':
			if (action.afterStairs) {
				return { ...state, pendingFlatAfterLeg: true }
			}
			if (state.phase === 'entering' || state.phase === 'cutaway') {
				return { ...state, pendingFlatAfterLeg: true }
			}
			return {
				phase: 'flat',
				cutawayMoment: null,
				pendingFlatAfterLeg: false
			}
		case 'camera-idle':
			if (state.phase === 'entering') {
				return {
					phase: 'cutaway',
					cutawayMoment: action.moment,
					pendingFlatAfterLeg: false
				}
			}
			if (state.pendingFlatAfterLeg) {
				return {
					phase: 'flat',
					cutawayMoment: null,
					pendingFlatAfterLeg: false
				}
			}
			return state
		default:
			return state
	}
}

interface UseMapNavStairsCameraOptions {
	routeResultRef: RefObject<RouteResult | null | undefined>
	stepsSnapshotRef: RefObject<{ steps: JourneyStep[]; stepIndex: number }>
}

export function useMapNavStairsCamera({
	routeResultRef,
	stepsSnapshotRef
}: UseMapNavStairsCameraOptions) {
	const [stairs, dispatch] = useReducer(
		stairsCameraReducer,
		initialStairsCameraState
	)
	const stairsRef = useRef(stairs)
	stairsRef.current = stairs

	const [navCamera, setNavCamera] = useState<{
		id: number
		command: NavCameraCommand | null
	}>({ id: 0, command: null })

	const bumpNavCamera = useCallback((command: NavCameraCommand) => {
		setNavCamera((previous) => ({
			id: previous.id + 1,
			command
		}))
	}, [])

	const onFocusStep = useCallback(
		(step: JourneyStep, ctx?: { leftStairsAt?: LonLat }) => {
			const routeResult = routeResultRef.current ?? null
			if (step.kind === 'stairs') {
				const at = step.change?.at
				if (at == null) {
					return
				}
				dispatch({ type: 'focus-stairs' })
				bumpNavCamera({ kind: 'stair-enter', at })
				return
			}
			if (step.kind === 'arrival') {
				dispatch({ type: 'focus-arrival' })
				return
			}
			const bounds =
				boundsForJourneyStep(step, routeResult) ??
				(ctx?.leftStairsAt != null
					? bboxOfCoords([ctx.leftStairsAt], STEP_FIT_MARGIN_M)
					: null)
			if (bounds == null) {
				return
			}
			const afterStairs =
				ctx?.leftStairsAt != null ||
				stairsRef.current.phase === 'entering' ||
				stairsRef.current.phase === 'cutaway'
			dispatch({ type: 'focus-walk', afterStairs })
			bumpNavCamera({
				kind: 'leg-bounds',
				bounds,
				resetFromStairs: afterStairs
			})
		},
		[bumpNavCamera, routeResultRef]
	)

	const onNavCameraIdle = useCallback(() => {
		const phase = stairsRef.current.phase
		if (phase === 'entering') {
			const { steps, stepIndex } = stepsSnapshotRef.current
			const step = steps[stepIndex]
			dispatch({
				type: 'camera-idle',
				moment: stairMomentFromStep(step)
			})
			return
		}
		if (stairsRef.current.pendingFlatAfterLeg) {
			dispatch({ type: 'camera-idle', moment: null })
		}
	}, [stepsSnapshotRef])

	const restoreDefaultMapView = useCallback(() => {
		dispatch({ type: 'reset' })
		setNavCamera({ id: 0, command: null })
	}, [])

	return {
		stairsPhase: stairs.phase,
		cutawayMoment: stairs.cutawayMoment,
		navCamera,
		onFocusStep,
		onNavCameraIdle,
		restoreDefaultMapView
	}
}
