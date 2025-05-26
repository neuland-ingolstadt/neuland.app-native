/* eslint-disable react-hooks/rules-of-hooks */
import WhatsNewBox from '@/components/Flow/WhatsnewBox'
import changelogData from '@/data/changelog.json'
import { useFlowStore } from '@/hooks/useFlowStore'
import type { LanguageKey } from '@/localization/i18n'
import type { Changelog } from '@/types/data'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { getContrastColor } from '@/utils/ui-utils'
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
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function WhatsNewScreen(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const changelog: Changelog = changelogData as Changelog
	const { t, i18n } = useTranslation('flow')
	const version = convertToMajorMinorPatch(
		Application.nativeApplicationVersion ?? '0.0.0'
	)
	const toggleUpdated = useFlowStore((state) => state.toggleUpdated)
	if (changelog.version[version] === undefined) {
		router.navigate('/(tabs)/(index)')
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
		<View style={styles.page}>
			<View style={styles.titleBox}>
				<Text style={styles.title}>{t('whatsnew.title')}</Text>
				<Text style={styles.subtitle}>
					{t('whatsnew.version', {
						version
					})}
				</Text>
			</View>

			<View style={[styles.boxesContainer, styles.boxes]}>
				{Object.keys(changelog.version)
					.filter((key) => key === version)
					.map((key, boxIndex) => (
						<View key={key} style={styles.boxes}>
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
			<View style={styles.buttonContainer}>
				<Pressable
					style={styles.button}
					onPress={() => {
						toggleUpdated()
						router.replace('/(tabs)/(index)')
					}}
				>
					<Text style={styles.buttonText}>{t('whatsnew.continue')}</Text>
				</Pressable>
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	boxes: {
		gap: 12
	},
	boxesContainer: {
		flex: 4,
		justifyContent: 'center'
	},
	button: {
		alignSelf: 'center',
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.md,
		paddingHorizontal: 20,
		paddingVertical: 15,
		width: '50%'
	},
	buttonContainer: {
		flex: 1
	},
	buttonText: {
		color: getContrastColor(theme.colors.primary),
		fontSize: 15,
		fontWeight: '600',
		textAlign: 'center'
	},
	page: {
		backgroundColor: theme.colors.contrast,
		flex: 1,
		gap: 20,
		paddingHorizontal: 20,
		paddingVertical: 40
	},
	subtitle: {
		color: theme.colors.labelColor,
		fontSize: 14,
		textAlign: 'center'
	},
	title: {
		color: theme.colors.text,
		fontSize: 32,
		fontWeight: 'bold',
		paddingBottom: 10,
		textAlign: 'center'
	},
	titleBox: {
		flex: 1,
		justifyContent: 'flex-end'
	}
}))
