import { trackEvent } from '@aptabase/react-native'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'burnt'
import { router } from 'expo-router'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { officePresenceQueryKey } from '@/components/Member/office-presence-section'
import { useUserKind } from '@/contexts/userKind'
import { useMemberStore } from '@/hooks/useMemberStore'
import { useSessionStore } from '@/hooks/useSessionStore'
import { evaluateBooleanFlag, FeatureFlagKeys } from '@/lib/feature-flags'
import {
	ensureMemberTokensLoaded,
	setOfficeTogglePending,
	toggleOfficePresence
} from '@/utils/office-presence-utils'

export default function OfficeToggle(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation('member')
	const memberSub = useMemberStore((s) => s.info?.sub as string | undefined)
	const { userKind } = useUserKind()
	const queryClient = useQueryClient()
	const [authReady, setAuthReady] = useState(false)
	const handledRef = useRef(false)
	const analyticsInitialized = useSessionStore((s) => s.analyticsInitialized)

	useEffect(() => {
		void ensureMemberTokensLoaded().finally(() => {
			setAuthReady(true)
		})
	}, [])

	useEffect(() => {
		if (!authReady || handledRef.current) {
			return
		}

		handledRef.current = true

		void (async () => {
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
				router.replace('/member')
				return
			}

			const currentIdToken = useMemberStore.getState().idToken
			if (!currentIdToken) {
				setOfficeTogglePending(true)
				router.replace('/member')
				return
			}

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

			router.replace('/member')
		})()
	}, [analyticsInitialized, authReady, memberSub, queryClient, t, userKind])

	return (
		<View style={styles.container}>
			<ActivityIndicator color={theme.colors.primary} />
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.background
	}
}))
