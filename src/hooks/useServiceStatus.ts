import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
	fetchCriticalServiceStatus,
	type ServiceStatusId,
	type ServiceStatusSnapshot,
	STATUS_BANNER_PREVIEW,
	shouldClearDismissedSignature,
	shouldShowServiceStatusBanner
} from '@/utils/gatus-status'
import { useServiceStatusStore } from './useServiceStatusStore'

const STALE_TIME_MS = STATUS_BANNER_PREVIEW ? 30_000 : 1000 * 60 * 5
const REFETCH_INTERVAL_MS = STATUS_BANNER_PREVIEW ? 60_000 : 1000 * 60 * 5

export function useServiceStatus() {
	const dismissedSignature = useServiceStatusStore((s) => s.dismissedSignature)
	const dismiss = useServiceStatusStore((s) => s.dismiss)
	const resetDismissed = useServiceStatusStore((s) => s.reset)

	const query = useQuery({
		queryKey: ['gatus', 'critical', STATUS_BANNER_PREVIEW],
		queryFn: fetchCriticalServiceStatus,
		staleTime: STALE_TIME_MS,
		gcTime: 1000 * 60 * 30,
		refetchInterval: REFETCH_INTERVAL_MS,
		refetchOnReconnect: true,
		retry: 1
	})

	const snapshot: ServiceStatusSnapshot | undefined = query.data
	const unhealthy = snapshot?.unhealthy ?? []
	const signature = snapshot?.signature ?? ''
	const hasOutage = unhealthy.length > 0
	const shouldShowBanner = shouldShowServiceStatusBanner(
		hasOutage,
		signature,
		dismissedSignature
	)

	useEffect(() => {
		if (
			shouldClearDismissedSignature(
				query.isSuccess,
				hasOutage,
				dismissedSignature
			)
		) {
			resetDismissed()
		}
	}, [query.isSuccess, hasOutage, dismissedSignature, resetDismissed])

	const isServiceDown = (id: ServiceStatusId): boolean =>
		unhealthy.some((service) => service.id === id)

	return {
		...query,
		snapshot,
		unhealthy,
		signature,
		hasOutage,
		shouldShowBanner,
		isServiceDown,
		dismiss: () => {
			if (signature !== '') {
				dismiss(signature)
			}
		}
	}
}
