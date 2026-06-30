import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

export default function GuestInfoSection(): React.JSX.Element {
	const { t } = useTranslation('settings')
	const secondaryColor = toColor(useCSSVariable('--color-secondary'))

	return (
		<Pressable
			className="bg-card border-border ios:rounded-ios android:rounded-md p-5 flex-row items-center justify-between gap-4 active:opacity-90"
			style={hairlineBorder}
			onPress={() => {
				router.navigate('/login')
			}}
		>
			<View className="flex-1">
				<Text className="text-text text-base font-semibold mb-1">
					{t('menu.guest.banner.title')}
				</Text>
				<Text className="text-label text-[13px] leading-[18px]">
					{t('menu.guest.banner.message')}
				</Text>
			</View>
			<View className="bg-secondary/20 rounded-infinite p-3">
				<PlatformIcon
					ios={{ name: 'sparkles', size: 24 }}
					android={{ name: 'auto_awesome', size: 28 }}
					web={{ name: 'Sparkles', size: 28 }}
					style={{ color: secondaryColor }}
				/>
			</View>
		</Pressable>
	)
}
