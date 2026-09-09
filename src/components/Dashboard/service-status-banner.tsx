import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { STATUS_URL } from '@/data/constants'
import type { ServiceHealth } from '@/utils/gatus-status'
import { toColor } from '@/utils/uniwind-utils'

interface ServiceStatusBannerProps {
	services: ServiceHealth[]
	onDismiss: () => void
}

export default function ServiceStatusBanner({
	services,
	onDismiss
}: ServiceStatusBannerProps): React.JSX.Element {
	const labelColor = toColor(useCSSVariable('--color-label'))
	const warningColor = toColor(useCSSVariable('--color-warning'))
	const { t } = useTranslation('settings')

	const message =
		services.length === 1
			? t('dashboard.serviceStatus.messageOne', {
					service: t(`dashboard.serviceStatus.services.${services[0].id}`)
				})
			: t('dashboard.serviceStatus.messageMany', {
					count: services.length,
					services: services
						.map((service) =>
							t(`dashboard.serviceStatus.services.${service.id}`)
						)
						.join(', ')
				})

	return (
		<Pressable
			testID="service-status-banner"
			className="bg-card border-hairline border-border rounded-lg mx-page my-1.5 w-auto overflow-hidden"
			onPress={() => {
				void Linking.openURL(STATUS_URL)
			}}
		>
			<View className="p-card">
				<View className="items-center flex-row gap-2.5">
					<View
						className="w-9 h-9 rounded-full justify-center items-center mr-1"
						style={{ backgroundColor: `${String(warningColor)}20` }}
					>
						<PlatformIcon
							ios={{ name: 'exclamationmark.triangle.fill', size: 15 }}
							android={{ name: 'warning', size: 23, variant: 'filled' }}
							web={{ name: 'TriangleAlert', size: 20 }}
							style={{ color: warningColor }}
						/>
					</View>
					<Text className="text-text flex-1 text-[17px] font-semibold">
						{t('dashboard.serviceStatus.title')}
					</Text>
					<Pressable
						onPress={(event) => {
							event.stopPropagation()
							onDismiss()
						}}
						hitSlop={10}
						accessibilityRole="button"
						accessibilityLabel={t('dashboard.serviceStatus.dismiss')}
						className="w-8 h-8 items-center justify-center"
						testID="service-status-banner-dismiss"
					>
						<PlatformIcon
							ios={{ name: 'xmark', size: 16 }}
							android={{ name: 'close', size: 24 }}
							web={{ name: 'X', size: 20 }}
							style={{ color: labelColor, opacity: 0.7 }}
						/>
					</Pressable>
				</View>
				<View className="flex-row gap-card items-start">
					<Text className="text-text text-[15px] mt-3 flex-1">{message}</Text>
				</View>
				<View className="mt-3 self-end">
					<Text className="text-label text-xs text-right">
						{t('dashboard.serviceStatus.link')}
					</Text>
				</View>
			</View>
		</Pressable>
	)
}
