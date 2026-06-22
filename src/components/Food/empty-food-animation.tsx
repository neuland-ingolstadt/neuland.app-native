import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/Icon'
import { toColor } from '@/utils/uniwind-utils'
import { PlateAnimation } from './plate-animation'

/**
 * An enhanced empty state component for the food screens that displays
 * a polished animation and guidance for the user.
 */
export const EmptyFoodAnimation = (): React.JSX.Element => {
	const { t } = useTranslation('food')
	const primaryColor = useCSSVariable('--color-primary') as string | undefined

	const handleSettingsPress = () => {
		router.navigate('/food-preferences')
	}

	return (
		<Animated.View
			className="flex-1 items-center justify-center w-full px-5 py-2.5"
			entering={FadeIn.duration(600).delay(300)}
		>
			<View className="w-full max-w-[480px] items-center py-4">
				<View className="mb-10 items-center">
					<PlateAnimation size={130} />
				</View>

				<View className="items-center w-full">
					<Text className="text-text text-2xl font-bold mb-3.5 text-center">
						{t('empty.title')}
					</Text>
					<Text className="text-label text-base text-center mb-9 leading-[22px] max-w-[90%]">
						{t('empty.description')}
					</Text>

					<View className="w-full self-center mb-10 mt-2 gap-4 px-4">
						<View className="flex-row gap-5 items-center">
							<PlatformIcon
								ios={{
									name: 'checkmark.circle',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'check_circle',
									size: 24
								}}
								web={{
									name: 'CircleCheck',
									size: 24
								}}
								style={{ color: toColor(primaryColor) }}
							/>
							<Text className="text-label text-[15px] flex-1">
								{t('empty.tip1')}
							</Text>
						</View>

						<View className="flex-row gap-5 items-center">
							<PlatformIcon
								ios={{
									name: 'calendar',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'calendar_today',
									size: 24
								}}
								web={{
									name: 'Calendar',
									size: 24
								}}
								style={{ color: toColor(primaryColor) }}
							/>
							<Text className="text-label text-[15px] flex-1">
								{t('empty.tip2')}
							</Text>
						</View>
					</View>

					<Pressable
						className="flex-row items-center justify-center bg-primary py-3.5 px-5 rounded-md gap-2.5 min-w-[220px]"
						onPress={handleSettingsPress}
					>
						<Text className="text-base font-semibold text-white">
							{t('empty.buttonSettings')}
						</Text>
						<PlatformIcon
							ios={{
								name: 'arrow.right',
								size: 18,
								weight: 'semibold'
							}}
							android={{
								name: 'arrow_forward',
								size: 20
							}}
							web={{
								name: 'ArrowRight',
								size: 20
							}}
							style={{ color: 'white' }}
						/>
					</Pressable>
				</View>
			</View>
		</Animated.View>
	)
}
