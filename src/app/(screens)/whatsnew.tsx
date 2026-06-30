/** biome-ignore-all lint/correctness/useHookAtTopLevel: not a problem here */
import * as Application from 'expo-application'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import { router } from 'expo-router'
import type React from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import WhatsNewBox from '@/components/Flow/whats-new-box'
import changelogData from '@/data/changelog.json'
import { useFlowStore } from '@/hooks/useFlowStore'
import type { LanguageKey } from '@/localization/i18n'
import type { Changelog } from '@/types/data'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function WhatsNewScreen(): React.JSX.Element {
	const changelog: Changelog = changelogData as Changelog
	const { t, i18n } = useTranslation('flow')
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const buttonTextColor = getContrastColor(primaryColor)
	const version = convertToMajorMinorPatch(
		Application.nativeApplicationVersion ?? '0.0.0'
	)
	const toggleUpdated = useFlowStore((state) => state.toggleUpdated)
	if (changelog.version[version] === undefined) {
		router.navigate('/(tabs)')
	}
	const totalItems = Object.keys(changelog.version[version] ?? []).flatMap(
		(key) => changelog.version[key]
	).length

	const opacityValues = changelog.version[version].map(() => useSharedValue(0))
	const rotationValues = Array.from({ length: totalItems }, () =>
		useSharedValue(0)
	)

	const handlePress = (index: number): void => {
		if (Platform.OS === 'ios') {
			void impactAsync(ImpactFeedbackStyle.Light)
		}
		const direction = Math.random() > 0.5 ? 1 : -1
		const rotation = rotationValues[index]
		rotation.value = withSequence(
			withTiming(direction * -1.5, {
				duration: 100,
				easing: Easing.linear
			}),
			withTiming(direction * 1, {
				duration: 100,
				easing: Easing.linear
			}),
			withTiming(direction * -0.5, {
				duration: 100,
				easing: Easing.linear
			}),
			withTiming(0, {
				duration: 100,
				easing: Easing.linear
			})
		)
	}

	useEffect(() => {
		const delay = 200
		setTimeout(() => {
			opacityValues.forEach((opacity, index) => {
				opacity.value = withDelay(
					index * 400,
					withTiming(1, {
						duration: 800,
						easing: Easing.linear
					})
				)
			})
		}, delay)
	}, [])

	return (
		<View className="bg-contrast flex-1 gap-5 px-5 py-10">
			<View className="flex-1 justify-end">
				<Text className="text-text text-[32px] font-bold pb-2.5 text-center">
					{t('whatsnew.title')}
				</Text>
				<Text className="text-label text-sm text-center">
					{t('whatsnew.version', {
						version
					})}
				</Text>
			</View>

			<View className="flex-[4] justify-center gap-3">
				{Object.keys(changelog.version)
					.filter((key) => key === version)
					.map((key, boxIndex) => (
						<View key={key} className="gap-3">
							{changelog.version[key].map(
								({ title, description, icon }, index) => {
									const overallIndex =
										boxIndex * changelog.version[key].length + index

									const opacityStyle = useAnimatedStyle(() => {
										return {
											opacity: opacityValues[overallIndex].value
										}
									})

									const rotationStyle = useAnimatedStyle(() => {
										return {
											transform: [
												{
													rotateZ: `${rotationValues[overallIndex].value}deg`
												}
											]
										}
									})

									return (
										<Animated.View
											key={title[i18n.language as LanguageKey]}
											style={[opacityStyle, rotationStyle]}
										>
											<Pressable
												onPress={() => {
													handlePress(overallIndex)
												}}
											>
												<WhatsNewBox
													title={title[i18n.language as LanguageKey]}
													description={
														description[i18n.language as LanguageKey]
													}
													icon={icon}
												/>
											</Pressable>
										</Animated.View>
									)
								}
							)}
						</View>
					))}
			</View>
			<View className="flex-1">
				<Pressable
					className="self-center bg-primary rounded-md px-5 py-[15px] w-1/2"
					onPress={() => {
						toggleUpdated()
						router.replace('/(tabs)')
					}}
				>
					<Text
						className="text-[15px] font-semibold text-center"
						style={{ color: buttonTextColor }}
					>
						{t('whatsnew.continue')}
					</Text>
				</Pressable>
			</View>
		</View>
	)
}
