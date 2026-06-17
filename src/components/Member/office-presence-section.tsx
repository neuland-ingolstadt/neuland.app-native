import { trackEvent } from '@aptabase/react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'
import {
	checkInToOffice,
	checkOutOfOffice,
	getOfficePresence
} from '@/api/office-presence-api'
import Button from '@/components/Universal/Button'
import PlatformIcon from '@/components/Universal/Icon'
import { useMemberStore } from '@/hooks/useMemberStore'
import PulsingDot from '../Universal/pulsing-dot'
import { stylesheet } from './styles'

export function officePresenceQueryKey(sub: string) {
	return ['officePresence', sub] as const
}

async function getValidOfficePresenceToken(): Promise<string> {
	const { idToken, info, refreshTokens } = useMemberStore.getState()
	if (!idToken) {
		throw new Error('No idToken available')
	}

	if (info?.exp) {
		const expirationTime = info.exp * 1000
		const remaining = expirationTime - Date.now()
		if (remaining <= 5000) {
			await refreshTokens()
			const updatedToken = useMemberStore.getState().idToken
			if (!updatedToken) {
				throw new Error('Failed to refresh token')
			}
			return updatedToken
		}
	}

	return idToken
}

export function OfficePresenceSection(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation('member')
	const queryClient = useQueryClient()
	const idToken = useMemberStore((s) => s.idToken)
	const info = useMemberStore((s) => s.info)
	const memberSub = info?.sub as string | undefined

	const { data, isLoading, isError } = useQuery({
		queryKey: officePresenceQueryKey(memberSub ?? ''),
		enabled: !!idToken && !!memberSub,
		queryFn: async () => {
			const token = await getValidOfficePresenceToken()
			return await getOfficePresence(token)
		},
		refetchInterval: 60_000,
		staleTime: 30_000
	})

	const mutation = useMutation({
		mutationFn: async (action: 'checkIn' | 'checkOut') => {
			const token = await getValidOfficePresenceToken()
			if (action === 'checkIn') {
				return await checkInToOffice(token)
			}
			return await checkOutOfOffice(token)
		},
		onSuccess: (_result, action) => {
			trackEvent('OfficePresence', { action })
			const sub = useMemberStore.getState().info?.sub as string | undefined
			if (sub) {
				void queryClient.invalidateQueries({
					queryKey: officePresenceQueryKey(sub)
				})
			}
		},
		onError: (mutationError) => {
			if (__DEV__) {
				console.debug(
					'[OfficePresence] mutation failed',
					mutationError instanceof Error ? mutationError.message : mutationError
				)
			}
		}
	})

	const handleToggle = (): void => {
		if (!data || mutation.isPending) {
			return
		}

		if (Platform.OS === 'ios') {
			void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
		}

		mutation.mutate(data.registered ? 'checkOut' : 'checkIn')
	}

	const count = data?.count ?? 0
	const countLabel = isLoading ? null : t('office.count', { count })

	return (
		<View style={styles.officeSection}>
			<Text style={styles.officeHeader}>{t('office.header')}</Text>
			<View style={styles.officeCard}>
				<View style={styles.officeCountRow}>
					<PlatformIcon
						ios={{ name: 'building.2', size: 22 }}
						android={{ name: 'apartment', size: 22 }}
						web={{ name: 'Building2', size: 22 }}
						style={{ color: theme.colors.primary }}
					/>
					{count > 0 && !isLoading && !isError ? (
						<PulsingDot style={styles.smallPulsingDot} />
					) : null}
					{isLoading ? (
						<ActivityIndicator color={theme.colors.primary} />
					) : (
						<Text style={styles.officeCountText}>
							{isError ? t('office.error') : countLabel}
						</Text>
					)}
				</View>

				<Button
					variant={data?.registered ? 'secondary' : 'primary'}
					onPress={handleToggle}
					disabled={isLoading || isError || mutation.isPending}
					loading={mutation.isPending}
				>
					{data?.registered ? t('office.checkOut') : t('office.checkIn')}
				</Button>
				<Text style={styles.disclaimer}>{t('office.disclaimer')}</Text>
			</View>
		</View>
	)
}
