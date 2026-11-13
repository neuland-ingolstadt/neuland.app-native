import { trackEvent } from '@aptabase/react-native'
import * as AppIntents from 'expo-app-intents'
import type { Href } from 'expo-router'
import { router, useRootNavigationState } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'

const OPEN_SCREEN_ROUTES = {
	openFood: '/food',
	openTimetable: '/timetable',
	openMap: '/map',
	openGrades: '/grades'
} as const satisfies Record<string, Href>

type OpenScreenIntentName = keyof typeof OPEN_SCREEN_ROUTES

function isOpenScreenIntentName(name: string): name is OpenScreenIntentName {
	return name in OPEN_SCREEN_ROUTES
}

async function handleInvocations(
	pendingIntents: AppIntents.AppIntentInvocation[],
	handledIds: Set<string>
): Promise<void> {
	for (const invocation of pendingIntents) {
		if (handledIds.has(invocation.id)) {
			continue
		}

		if (!isOpenScreenIntentName(invocation.name)) {
			console.warn(
				'Discarding unknown App Intent invocation',
				invocation.name,
				invocation.id
			)
			await AppIntents.removePendingInvocationAsync(invocation.id)
			continue
		}

		try {
			handledIds.add(invocation.id)
			router.navigate(OPEN_SCREEN_ROUTES[invocation.name])
			trackEvent('AppIntent', { name: invocation.name })
			await AppIntents.removePendingInvocationAsync(invocation.id)
		} catch (error) {
			handledIds.delete(invocation.id)
			console.warn(
				'App Intent remains pending',
				invocation.id,
				invocation.name,
				error
			)
		}
	}
}

/**
 * Handles Siri / Shortcuts App Intent invocations that open known screens.
 * Cold-start pending intents stay queued until the root navigator is ready.
 */
export function useAppIntentsHandler(): void {
	const rootNavigationState = useRootNavigationState()
	const navigationReady = rootNavigationState?.key != null
	const navigationReadyRef = useRef(navigationReady)
	const handledIds = useRef(new Set<string>())

	navigationReadyRef.current = navigationReady

	AppIntents.useAppIntents(async (pendingIntents) => {
		if (Platform.OS !== 'ios' || !navigationReadyRef.current) {
			return
		}

		await handleInvocations(pendingIntents, handledIds.current)
	})

	useEffect(() => {
		if (Platform.OS !== 'ios' || !navigationReady) {
			return
		}

		let cancelled = false
		void AppIntents.getPendingInvocationsAsync().then(async (pending) => {
			if (cancelled || pending.length === 0) {
				return
			}
			await handleInvocations(pending, handledIds.current)
		})

		return () => {
			cancelled = true
		}
	}, [navigationReady])
}
