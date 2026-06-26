import { trackEvent } from '@aptabase/react-native'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'burnt'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { officePresenceQueryKey } from '@/components/Member/office-presence-section'
import { useUserKind } from '@/contexts/userKind'
import { useMemberStore } from '@/hooks/useMemberStore'
import { useSessionStore } from '@/hooks/useSessionStore'
import { evaluateBooleanFlag, FeatureFlagKeys } from '@/lib/feature-flags'
import {
	consumeOfficeTogglePending,
	isOfficeTogglePending,
	toggleOfficePresence
} from '@/utils/office-presence-utils'

export function useOfficeToggleAfterLogin(): void {
	const idToken = useMemberStore((s) => s.idToken)
	const memberSub = useMemberStore((s) => s.info?.sub as string | undefined)
	const { userKind } = useUserKind()
	const queryClient = useQueryClient()
	const { t } = useTranslation('member')
	const analyticsInitialized = useSessionStore((s) => s.analyticsInitialized)

	useEffect(() => {
		if (!idToken) {
			return
		}

		void (async () => {
			if (!isOfficeTogglePending()) {
				return
			}

			const enabled = await evaluateBooleanFlag(
				FeatureFlagKeys.memberOfficePresenceEnabled,
				false,
				{ userKind: userKind ?? 'guest' }
			)

			if (!enabled) {
				toast({
					title: t('office.toggleDisabled'),
					preset: 'error',
					haptic: 'error',
					duration: 2.5,
					from: 'top'
				})
				return
			}

			consumeOfficeTogglePending()

			try {
				const action = await toggleOfficePresence()
				if (analyticsInitialized) {
					trackEvent('OfficePresence', { action, origin: 'DeepLink' })
				}
				if (memberSub) {
					void queryClient.invalidateQueries({
						queryKey: officePresenceQueryKey(memberSub)
					})
				}
				toast({
					title: t(
						action === 'checkIn'
							? 'office.checkInSuccess'
							: 'office.checkOutSuccess'
					),
					preset: 'done',
					haptic: 'success',
					duration: 2.5,
					from: 'top'
				})
			} catch {
				toast({
					title: t('office.toggleError'),
					preset: 'error',
					haptic: 'error',
					duration: 2.5,
					from: 'top'
				})
			}
		})()
	}, [analyticsInitialized, idToken, memberSub, queryClient, t, userKind])
}
