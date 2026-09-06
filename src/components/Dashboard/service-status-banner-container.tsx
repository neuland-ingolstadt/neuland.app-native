import { trackEvent } from '@aptabase/react-native'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { useServiceStatus } from '@/hooks/useServiceStatus'
import { useSessionStore } from '@/hooks/useSessionStore'
import ServiceStatusBanner from './service-status-banner'

const ServiceStatusBannerContainer = (): React.JSX.Element | null => {
	const { shouldShowBanner, unhealthy, signature, dismiss } = useServiceStatus()
	const analyticsInitialized = useSessionStore((s) => s.analyticsInitialized)
	const trackedSignature = useRef<string | null>(null)

	useEffect(() => {
		if (
			!analyticsInitialized ||
			!shouldShowBanner ||
			signature === '' ||
			trackedSignature.current === signature
		) {
			return
		}
		trackedSignature.current = signature
		trackEvent('ServiceStatus', {
			signature,
			count: unhealthy.length
		})
	}, [analyticsInitialized, shouldShowBanner, signature, unhealthy.length])

	if (!shouldShowBanner) {
		return null
	}

	return <ServiceStatusBanner services={unhealthy} onDismiss={dismiss} />
}

export default ServiceStatusBannerContainer
