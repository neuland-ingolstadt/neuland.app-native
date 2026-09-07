import { Stack } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import LogoSVG from '@/components/Flow/svgs/logo'
import { HomeHeaderRight } from '@/components/Home/home-header-right'
import { useTransparentHeaderStyle } from '@/hooks/useTransparentHeader'

const HeaderLeft = (): React.JSX.Element => {
	return (
		<View className="pl-4 pr-2">
			<LogoSVG size={24} />
		</View>
	)
}

export default function HomeLayout(): React.JSX.Element {
	const { t } = useTranslation('navigation')
	const transparentHeaderStyle = useTransparentHeaderStyle()

	return (
		<Stack screenOptions={transparentHeaderStyle}>
			<Stack.Screen
				name="index"
				options={{
					title: t('navigation.dashboard'),
					headerLargeTitle: Platform.OS === 'ios',
					headerRight:
						Platform.OS === 'ios' ? undefined : () => <HomeHeaderRight />,
					headerLeft: Platform.OS === 'web' ? () => <HeaderLeft /> : undefined,
					...transparentHeaderStyle
				}}
			/>
		</Stack>
	)
}
