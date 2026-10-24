import { useEffect, useState } from 'react'
import { AccessibilityInfo, Platform } from 'react-native'

/** Mirrors the MVP `prefers-reduced-motion` check on web and native. */
export function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false)

	useEffect(() => {
		if (Platform.OS === 'web') {
			const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
			if (mq == null) {
				return
			}
			const update = (): void => {
				setReduced(mq.matches)
			}
			update()
			mq.addEventListener('change', update)
			return () => {
				mq.removeEventListener('change', update)
			}
		}
		let subscription: { remove: () => void } | undefined
		AccessibilityInfo.isReduceMotionEnabled()
			.then(setReduced)
			.catch(() => {})
		subscription = AccessibilityInfo.addEventListener(
			'reduceMotionChanged',
			setReduced
		)
		return () => {
			subscription?.remove()
		}
	}, [])

	return reduced
}
