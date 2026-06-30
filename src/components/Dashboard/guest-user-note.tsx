import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import PlatformIcon from '@/components/Universal/icon'

export default function GuestUserNote(): React.JSX.Element {
	const { t } = useTranslation(['settings'])

	return (
		<Pressable
			className="rounded-md overflow-hidden bg-card mt-[3px] px-3"
			onPress={() => {
				router.navigate('/login')
			}}
		>
			<View className="items-center flex-row gap-2 justify-start pt-3 py-[9px]">
				<PlatformIcon
					ios={{ name: 'lock', size: 20 }}
					android={{ name: 'lock', size: 24 }}
					web={{ name: 'Lock', size: 24 }}
				/>
				<Text className="text-primary text-[17px] font-semibold text-left">
					{t('dashboard.unavailable.title')}
				</Text>
			</View>
			<Text className="text-text text-[15px] mb-3 text-left">
				{t('dashboard.unavailable.message')}
			</Text>
		</Pressable>
	)
}
