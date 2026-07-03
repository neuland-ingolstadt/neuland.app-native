import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { toColor } from '@/utils/uniwind-utils'

import PlatformIcon from '../Universal/icon'

export const AllergensBanner = ({
	scrollY
}: {
	scrollY: Animated.Value
}): React.JSX.Element => {
	const { t } = useTranslation('common')
	const initAllergenSelection = useFoodFilterStore(
		(state) => state.initAllergenSelection
	)
	const borderColor = toColor(useCSSVariable('--color-border'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const primary = primaryColor != null ? String(primaryColor) : ''

	return (
		<Animated.View
			className="border-b-border px-3"
			style={{
				borderBottomWidth: scrollY.interpolate({
					inputRange: [0, 0, 0],
					outputRange: [0, 0, 0.5],
					extrapolate: 'clamp'
				}),
				borderBottomColor: borderColor
			}}
		>
			<View
				className="rounded-md mb-2.5 mt-0.5 p-2.5 border"
				style={{
					backgroundColor: `${primary}33`,
					borderColor: `${primary}20`,
					shadowColor: primary,
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
					className="rounded-md p-1.5 absolute right-1.5 top-1.5 z-[1]"
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
						style={{ color: primary }}
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
