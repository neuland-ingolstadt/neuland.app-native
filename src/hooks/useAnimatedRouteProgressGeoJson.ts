import type { FeatureCollection } from 'geojson'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
	clipRouteProgressGeoJson,
	easeOutCubic,
	ROUTE_DRAW_MS,
	shouldPlayRouteDrawAnimation
} from '@/utils/indoor-nav/route-line-draw'

/** Elapsed-time clock — do not mix with rAF's timestamp (differs on native Hermes). */
function animationNowMs(): number {
	return Date.now()
}

type DrawFrameHandle = number | ReturnType<typeof setTimeout>

function scheduleDrawFrame(onFrame: () => void): DrawFrameHandle {
	if (Platform.OS === 'web') {
		return requestAnimationFrame(onFrame)
	}
	return setTimeout(onFrame, 16)
}

function cancelDrawFrame(handle: DrawFrameHandle): void {
	if (Platform.OS === 'web') {
		cancelAnimationFrame(handle as number)
		return
	}
	clearTimeout(handle as ReturnType<typeof setTimeout>)
}

function withDrawSeq(fc: FeatureCollection, seq: number): FeatureCollection {
	if (Platform.OS === 'web') {
		return fc
	}
	return {
		type: 'FeatureCollection',
		features: fc.features.map((feature) => ({
			...feature,
			properties: { ...feature.properties, _drawSeq: seq }
		}))
	}
}

export function useAnimatedRouteProgressGeoJson(
	routeProgressGeoJSON: FeatureCollection,
	animationKey: string | null
): FeatureCollection {
	const reducedMotion = usePrefersReducedMotion()
	const geoRef = useRef(routeProgressGeoJSON)
	geoRef.current = routeProgressGeoJSON
	const [displayed, setDisplayed] = useState(routeProgressGeoJSON)
	const animatingRef = useRef(false)
	const activeKeyRef = useRef<string | null>(null)

	useLayoutEffect(() => {
		if (animationKey == null) {
			activeKeyRef.current = null
			animatingRef.current = false
			setDisplayed(geoRef.current)
			return
		}

		const full = geoRef.current
		if (
			reducedMotion ||
			full.features.length === 0 ||
			!shouldPlayRouteDrawAnimation(full)
		) {
			activeKeyRef.current = animationKey
			animatingRef.current = false
			setDisplayed(full)
			return
		}

		if (activeKeyRef.current === animationKey) {
			if (!animatingRef.current) {
				setDisplayed(full)
			}
			return
		}

		activeKeyRef.current = animationKey

		let cancelled = false
		let frameHandle: DrawFrameHandle | null = null
		let drawSeq = 0
		const startMs = animationNowMs()
		animatingRef.current = true
		setDisplayed(withDrawSeq(clipRouteProgressGeoJson(full, 0), drawSeq++))

		const tick = () => {
			if (cancelled) {
				return
			}
			const latest = geoRef.current
			const t = Math.min(1, (animationNowMs() - startMs) / ROUTE_DRAW_MS)
			const eased = easeOutCubic(t)
			setDisplayed(
				withDrawSeq(clipRouteProgressGeoJson(latest, eased), drawSeq++)
			)
			if (t < 1) {
				frameHandle = scheduleDrawFrame(tick)
			} else {
				animatingRef.current = false
				setDisplayed(latest)
			}
		}

		frameHandle = scheduleDrawFrame(tick)
		return () => {
			cancelled = true
			if (frameHandle != null) {
				cancelDrawFrame(frameHandle)
			}
			animatingRef.current = false
		}
	}, [animationKey, reducedMotion])

	useEffect(() => {
		if (animationKey == null || animatingRef.current) {
			return
		}
		if (activeKeyRef.current !== animationKey) {
			return
		}
		setDisplayed(geoRef.current)
	}, [routeProgressGeoJSON, animationKey])

	return displayed
}
