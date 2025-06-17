import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import { useCallback, useState } from 'react'
import { Platform } from 'react-native'
import { defineAnimation, runOnJS } from 'react-native-reanimated'

import { getRandomHSLColor } from './ui-utils'

interface AnimationState {
	current: number
	lastTimestamp: number
	direction: number
}

export function animatedHapticFeedback(): void {
	'worklet'
	const shouldVibrate = Platform.OS === 'ios'
	if (shouldVibrate) runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
}

export function useRandomColor(): {
	color: string
	randomizeColor: () => void
} {
	const [color, setColor] = useState(getRandomHSLColor)

	const randomizeColor = useCallback(() => {
		setColor(getRandomHSLColor())
	}, [])

	return { color, randomizeColor }
}

export function withBouncing(
	velocity: number,
	bottomBound: number,
	topBound: number,
	randomizeColor: () => void
):
	| {
			onFrame: (state: AnimationState, now: number) => boolean
			onStart: (state: AnimationState, _value: number, now: number) => void
	  }
	| number {
	'worklet'
	return defineAnimation(
		{
			current: bottomBound,
			lastTimestamp: Date.now(),
			direction: 1
		},
		(): {
			onFrame: (state: AnimationState, now: number) => boolean
			onStart: (state: AnimationState, _value: number, now: number) => void
		} => {
			'worklet'
			const onFrame = (state: AnimationState, now: number): boolean => {
				const delta = (now - state.lastTimestamp) / 1000
				state.current += state.direction * delta * velocity

				if (state.current < bottomBound || state.current > topBound) {
					state.direction *= -1
					state.current = Math.min(
						Math.max(state.current, bottomBound),
						topBound
					)

					runOnJS(randomizeColor)()
					animatedHapticFeedback()
				}

				state.lastTimestamp = now
				return false
			}

			const onStart = (
				state: AnimationState,
				_value: number,
				now: number
			): void => {
				state.current = bottomBound + 0.8 * (topBound - bottomBound)
				state.lastTimestamp = now
				state.direction = 1
			}

			return { onFrame, onStart }
		}
	)
}
