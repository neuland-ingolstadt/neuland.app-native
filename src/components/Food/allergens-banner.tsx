import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { toColor } from '@/utils/uniwind-utils'

import PlatformIcon from '../Universal/Icon'

export const AllergensBanner = ({
	scrollY
}: {
	scrollY: Animated.Value
}): React.JSX.Element => {
	const { t } = useTranslation('common')
	const initAllergenSelection = useFoodFilterStore(
		(state) => state.initAllergenSelection
	)
	const borderColor = useCSSVariable('--color-border')
	const primaryColor = useCSSVariable('--color-primary') as string | undefined

	return (
		<Animated.View
			className="px-3"
			style={{
				borderBottomColor: toColor(borderColor),
				borderBottomWidth: scrollY.interpolate({
					inputRange: [0, 0, 0],
					outputRange: [0, 0, 0.5],
					extrapolate: 'clamp'
				})
			}}
		>
			<View
				className="bg-primary-background border border-primary/20 rounded-md mb-2.5 mt-0.5 p-2.5"
				style={{
					shadowColor: toColor(primaryColor),
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.1,
					shadowRadius: 2
				}}
			>
				<TouchableOpacity
					onPress={() => {
						initAllergenSelection()
					}}
					hitSlop={6}
					className="absolute right-[5px] top-[5px] z-[1] rounded-md p-[5px]"
				>
					<PlatformIcon
						ios={{
							name: 'xmark',
							size: 12
						}}
						android={{
							name: 'close',
							size: 20
						}}
						web={{
							name: 'X',
							size: 20
						}}
						style={{ color: toColor(primaryColor) }}
					/>
				</TouchableOpacity>
				<View>
					<TouchableOpacity
						onPress={() => {
							router.navigate('/food-allergens')
						}}
					>
						<Text className="text-primary text-base font-bold">
							{t('navigation.allergens', {
								ns: 'navigation'
							})}
						</Text>

						<Text className="text-text text-sm mt-[3px] opacity-90">
							{t('empty.config', { ns: 'food' })}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Animated.View>
	)
}
