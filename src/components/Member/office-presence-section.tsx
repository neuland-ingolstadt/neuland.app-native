import { trackEvent } from '@aptabase/react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'burnt'
import * as Haptics from 'expo-haptics'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import {
	checkInToOffice,
	checkOutOfOffice,
	getOfficePresence
} from '@/api/office-presence-api'
import Button from '@/components/Universal/button'
import PlatformIcon from '@/components/Universal/icon'
import PulsingDot from '@/components/Universal/pulsing-dot'
import { useMemberStore } from '@/hooks/useMemberStore'
import { getValidOfficePresenceToken } from '@/utils/office-presence-utils'
import { toColor } from '@/utils/uniwind-utils'

export function officePresenceQueryKey(sub: string) {
	return ['officePresence', sub] as const
}

export function OfficePresenceSection(): React.JSX.Element {
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const successColor = String(useCSSVariable('--color-success') ?? '#21bc21')
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
		onError: (_mutationError, action) => {
			toast({
				title: t(
					action === 'checkIn' ? 'office.checkInError' : 'office.checkOutError'
				),
				preset: 'error',
				haptic: 'error',
				duration: 2.5,
				from: 'top'
			})
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
		<View className="mb-6">
			<Text className="text-label-secondary text-[13px] font-semibold mb-2 ml-1 uppercase">
				{t('office.header')}
			</Text>
			<View className="bg-card rounded-lg gap-4 p-4">
				<View className="items-center flex-row gap-3">
					<PlatformIcon
						ios={{ name: 'building.2', size: 22 }}
						android={{ name: 'apartment', size: 22 }}
						web={{ name: 'Building2', size: 22 }}
						style={{ color: primaryColor }}
					/>
					{count > 0 && !isLoading && !isError ? (
						<PulsingDot
							style={{
								backgroundColor: successColor,
								borderRadius: 3,
								height: 6,
								width: 6
							}}
						/>
					) : null}
					{isLoading ? (
						<ActivityIndicator color={primaryColor} />
					) : (
						<Text className="text-text flex-1 text-base font-semibold">
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
				<Text className="text-label-secondary text-xs">
					{t('office.disclaimer')}
				</Text>
			</View>
		</View>
	)
}
