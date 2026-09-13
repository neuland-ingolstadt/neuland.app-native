import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
	EMPTY_UNHEALTHY,
	fetchCriticalServiceStatus,
	filterMatchingOutages,
	type ServiceHealth,
	type ServiceStatus,
	type ServiceStatusSnapshot,
	STATUS_BANNER_PREVIEW,
	shouldClearDismissedSignature,
	shouldShowServiceStatusBanner
} from '@/utils/gatus-status'
import { useServiceStatusStore } from './useServiceStatusStore'

const STALE_TIME_MS = STATUS_BANNER_PREVIEW ? 30_000 : 1000 * 60 * 5
const REFETCH_INTERVAL_MS = STATUS_BANNER_PREVIEW ? 60_000 : 1000 * 60 * 5

const gatusStatusQueryKey = [
	'gatus',
	'critical',
	STATUS_BANNER_PREVIEW
] as const

const gatusStatusQueryOptions = {
	queryKey: gatusStatusQueryKey,
	queryFn: fetchCriticalServiceStatus,
	staleTime: STALE_TIME_MS,
	gcTime: 1000 * 60 * 30,
	refetchInterval: REFETCH_INTERVAL_MS,
	refetchOnReconnect: true,
	retry: 1
} as const

function useUnhealthyServices(enabled = true): readonly ServiceHealth[] {
	const { data } = useQuery({
		...gatusStatusQueryOptions,
		enabled,
		select: (snapshot: ServiceStatusSnapshot) => snapshot.unhealthy
	})
	return data ?? EMPTY_UNHEALTHY
}

/** Dashboard banner: poll + dismiss state. */
export function useServiceStatus() {
	const dismissedSignature = useServiceStatusStore((s) => s.dismissedSignature)
	const dismissStore = useServiceStatusStore((s) => s.dismiss)
	const resetDismissed = useServiceStatusStore((s) => s.reset)

	const { data: snapshot, isSuccess } = useQuery(gatusStatusQueryOptions)

	const unhealthy = snapshot?.unhealthy ?? EMPTY_UNHEALTHY
	const signature = snapshot?.signature ?? ''
	const hasOutage = unhealthy.length > 0
	const shouldShowBanner = shouldShowServiceStatusBanner(
		hasOutage,
		signature,
		dismissedSignature
	)

	useEffect(() => {
		if (
			shouldClearDismissedSignature(isSuccess, hasOutage, dismissedSignature)
		) {
			resetDismissed()
		}
	}, [isSuccess, hasOutage, dismissedSignature, resetDismissed])

	return {
		unhealthy,
		signature,
		hasOutage,
		shouldShowBanner,
		dismiss: () => {
			if (signature !== '') {
				dismissStore(signature)
			}
		}
	}
}

/** Login / feature checks for a single critical service. */
export function useIsServiceDown(id: ServiceStatus): boolean {
	const unhealthy = useUnhealthyServices()
	return unhealthy.some((service) => service.id === id)
}

/**
 * ErrorView helper: overlapping outages for the screen's related services.
 * Skips the Gatus subscription when `services` is omitted.
 */
export function useMatchedServiceOutage(
	services: ServiceStatus | readonly ServiceStatus[] | undefined
): ServiceHealth[] {
	const unhealthy = useUnhealthyServices(services != null)
	return filterMatchingOutages(unhealthy, services)
}
