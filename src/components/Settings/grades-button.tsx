import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'

const GradesButton = (): React.JSX.Element => {
	const { t } = useTranslation('settings')
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelTertiaryColor = toColor(useCSSVariable('--color-label-tertiary'))

	return (
		<Pressable
			onPress={() => {
				router.navigate('/grades')
			}}
			className="w-full active:opacity-90"
		>
			<View className="flex-row items-center py-[15px]">
				<View className="w-7 items-center justify-center ml-4">
					<PlatformIcon
						ios={{
							name: 'book',
							size: 18
						}}
						android={{
							name: 'bar_chart_4_bars',
							size: 20
						}}
						web={{
							name: 'ChartColumnBig',
							size: 20
						}}
						style={{ color: textColor }}
					/>
				</View>

				<View className="flex-1 flex-row justify-between pl-4 pr-2">
					<Text className="text-text text-base shrink pr-2">
						{t('profile.formlist.grades.button')}
					</Text>
				</View>

				<View className="mr-4 items-center justify-center w-4">
					<PlatformIcon
						style={{ color: labelTertiaryColor }}
						ios={{
							name: 'chevron.right',
							size: 14,
							weight: 'semibold'
						}}
						android={{
							name: 'chevron_right',
							size: 16
						}}
						web={{
							name: 'ChevronRight',
							size: 16
						}}
					/>
				</View>
			</View>
		</Pressable>
	)
}

export default GradesButton
