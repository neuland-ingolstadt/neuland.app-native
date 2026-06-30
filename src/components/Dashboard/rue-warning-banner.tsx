import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { primussLink } from '@/data/constants'
import { useRueWarningStore } from '@/hooks/useRueWarningStore'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

interface RueWarningBannerProps {
	eventId: string | undefined
}

export default function RueWarningBanner({
	eventId
}: RueWarningBannerProps): React.JSX.Element | null {
	const labelColor = toColor(useCSSVariable('--color-label'))
	const warningColor = toColor(useCSSVariable('--color-warning'))
	const { t } = useTranslation(['settings'])
	const dismissedEventId = useRueWarningStore((state) => state.dismissedEventId)
	const dismiss = useRueWarningStore((state) => state.dismiss)

	if (eventId == null || dismissedEventId === eventId) {
		return null
	}

	return (
		<Pressable
			className="bg-card border-border rounded-lg mx-page my-1.5 w-auto overflow-hidden"
			style={hairlineBorder}
			onPress={() => Linking.openURL(primussLink)}
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
						{t('dashboard.rueWarning.title', { ns: 'settings' })}
					</Text>
					<Pressable
						onPress={() => dismiss(eventId)}
						hitSlop={10}
						className="w-8 h-8 items-center justify-center"
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
					<Text className="text-text text-[15px] mt-3 flex-1">
						{t('dashboard.rueWarning.message', { ns: 'settings' })}
					</Text>
				</View>
				<View className="mt-3 self-end">
					<Text className="text-label text-xs text-right">
						{t('dashboard.rueWarning.link', { ns: 'settings' })}
					</Text>
				</View>
			</View>
		</Pressable>
	)
}
