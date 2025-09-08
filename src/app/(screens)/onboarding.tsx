/** biome-ignore-all lint/correctness/useHookAtTopLevel: not a problem here */
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Dimensions,
	Linking,
	Platform,
	Pressable,
	Text,
	useWindowDimensions,
	View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import AnimatedText from '@/components/Flow/svgs/animated-text'
import LogoSVG from '@/components/Flow/svgs/logo'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import WhatsNewBox from '@/components/Flow/whats-new-box'
import PlatformIcon from '@/components/Universal/Icon'
import { PRIVACY_URL } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import type { OnboardingCardData } from '@/types/data'
import { getContrastColor } from '@/utils/ui-utils'

export default function OnboardingScreen(): React.JSX.Element {
	const { t } = useTranslation('flow')
	const setOnboarded = useFlowStore((state) => state.setOnboarded)
	const toggleUpdated = useFlowStore((state) => state.toggleUpdated)
	const setAnalyticsAllowed = useFlowStore((state) => state.setAnalyticsAllowed)

	const data: OnboardingCardData[] = [
		{
			title: t('onboarding.cards.title1'),
			description: t('onboarding.cards.description1'),
			icon: {
				ios: 'square.stack.3d.up',
				android: 'hub',
				web: 'Layers'
			}
		},

		{
			title: t('onboarding.cards.title2'),
			description: t('onboarding.cards.description2'),
			icon: {
				ios: 'person.2.gobackward',
				android: 'volunteer_activism',
				web: 'Users'
			}
		},
		{
			title: t('onboarding.cards.title3'),
			description: t('onboarding.cards.description3'),
			icon: {
				ios: 'lock.app.dashed',
				android: 'encrypted',
				web: 'GlobeLock'
			}
		}
	]

	const ContinueButton = (): React.JSX.Element => {
		const { styles } = useStyles(stylesheet)
		return (
			<Pressable
				style={styles.button}
				onPress={() => {
					if (Platform.OS === 'ios') {
						void Haptics.selectionAsync()
					}
					setOnboarded()
					toggleUpdated()
					setAnalyticsAllowed(true)
					router.navigate({
						pathname: '/login',
						params: { fromOnboarding: 'true' }
					})
				}}
				disabled={buttonDisabled}
			>
				<Text style={styles.buttonText}>{t('whatsnew.continue')}</Text>
			</Pressable>
		)
	}

	const cardsOpacity = data.map(() => useSharedValue(0))
	const cardsTranslateY = data.map(() => useSharedValue(20))
	const legalOpacity = useSharedValue(0)
	const legalTranslateY = useSharedValue(20)
	const logoOpacity = useSharedValue(0)
	const textTranslateY = useSharedValue(20)
	const textOpacity = useSharedValue(0)
	const cardsViewHeight = useSharedValue(0)
	const textLogoOpacity = useSharedValue(1)
	const logoMargin = useSharedValue(1)
	const helpOpacity = useSharedValue(0)
	const [isWhobbleDisabled, setWhobbleDisabled] = useState(true)
	const window = Dimensions.get('window')

	const CardsElement = (): React.JSX.Element => {
		const { styles } = useStyles(stylesheet)
		return (
			<Animated.View style={[styles.boxesContainer, styles.boxes]}>
				{data.map(({ title, description, icon }, index) => {
					const rotation = useSharedValue(0)

					const animatedStyles = useAnimatedStyle(() => {
						return {
							transform: [{ rotateZ: `${rotation.value}deg` }]
						}
					})

					const handlePress = (): void => {
						if (Platform.OS === 'ios') {
							void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
						}
						const direction = Math.random() > 0.5 ? 1 : -1
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

					const animatedStyle = useAnimatedStyle(() => ({
						opacity: cardsOpacity[index].value,
						transform: [{ translateY: cardsTranslateY[index].value }]
					}))

					return (
						<Pressable
							onPress={() => {
								if (!isWhobbleDisabled) {
									handlePress()
								}
							}}
							key={index}
						>
							<Animated.View style={animatedStyles}>
								<Animated.View style={animatedStyle}>
									<WhatsNewBox
										title={title}
										description={description}
										icon={icon}
									/>
								</Animated.View>
							</Animated.View>
						</Pressable>
					)
				})}
			</Animated.View>
		)
	}

	const LegalArea = (): React.JSX.Element => {
		const legalAnimatedStyle = useAnimatedStyle(() => ({
			opacity: legalOpacity.value,
			transform: [{ translateY: legalTranslateY.value }]
		}))
		const { styles } = useStyles(stylesheet)
		return (
			<Animated.View style={{ ...legalAnimatedStyle }}>
				<View
					style={{
						...styles.privacyRow,
						marginBottom: window.height * 0.035,
						marginTop: window.height * 0.008
					}}
				>
					<Text
						style={{
							...styles.privacyText,

							maxWidth: window.width
						}}
						numberOfLines={2}
					>
						<Text>{t('onboarding.links.agree1')}</Text>
						<Text
							disabled={buttonDisabled}
							style={styles.linkPrivacy}
							onPress={() => {
								void Linking.openURL(PRIVACY_URL)
							}}
						>
							{t('onboarding.links.privacy')}
						</Text>
						<Text>{t('onboarding.links.agree2')}</Text>
					</Text>
				</View>
				<ContinueButton />
			</Animated.View>
		)
	}

	const insets = useSafeAreaInsets()

	const textLogoAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: textLogoOpacity.value
		}
	})

	const logoAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: logoOpacity.value
		}
	})

	const textAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: textTranslateY.value }],
			opacity: textOpacity.value
		}
	})

	const helpAnimatedStyle = useAnimatedStyle(() => {
		return {
			position: 'absolute',
			top: insets.top + 15,
			right: 18,
			opacity: helpOpacity.value
		}
	})

	useEffect(() => {
		logoOpacity.value = withDelay(
			250,
			withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }, () => {
				textTranslateY.value = withTiming(0, {
					duration: 800,
					easing: Easing.out(Easing.quad)
				})

				textOpacity.value = withTiming(
					1,
					{
						duration: 900,
						easing: Easing.out(Easing.quad)
					},
					() => {
						logoMargin.value = withDelay(
							1250,
							withTiming(0, {
								duration: 1200,
								easing: Easing.out(Easing.quad)
							})
						)
						textLogoOpacity.value = withDelay(
							1250,
							withTiming(0, {
								duration: 600,
								easing: Easing.out(Easing.quad)
							})
						)
						logoOpacity.value = withDelay(
							800,
							withTiming(
								0,
								{
									duration: 800,
									easing: Easing.out(Easing.quad)
								},
								() => {
									cardsViewHeight.value = withTiming(
										reanimatedWindow.height * 0.4,
										{
											duration: 50,
											easing: Easing.out(Easing.quad)
										}
									)
									const initialDelay = 800
									data.forEach((_, index) => {
										const delay = initialDelay + index * 100

										cardsOpacity[index].value = withDelay(
											delay,
											withTiming(1, {
												duration: 500
											})
										)

										cardsTranslateY[index].value = withDelay(
											delay,
											withTiming(0, {
												duration: 500
											})
										)
									})
									runOnJS(setWhobbleDisabled)(false)
									helpOpacity.value = withDelay(
										1400,
										withTiming(1, {
											duration: 500,
											easing: Easing.out(Easing.quad)
										})
									)
									legalOpacity.value = withDelay(
										1400,
										withTiming(1, {
											duration: 500,
											easing: Easing.out(Easing.quad)
										})
									)

									legalTranslateY.value = withDelay(
										1400,
										withTiming(
											0,
											{
												duration: 500,
												easing: Easing.out(Easing.quad)
											},
											(isFinished) => {
												if (isFinished === true) {
													runOnJS(setButtonDisabled)(false)
												}
											}
										)
									)
								}
							)
						)
					}
				)
			})
		)
	}, [])

	const reanimatedWindow = useWindowDimensions()
	const logoFadeOutAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: logoOpacity.value,
			height: 150 * logoMargin.value,
			marginTop: logoMargin.value * reanimatedWindow.height * 0.5,
			marginBottom: logoMargin.value * 40
		}
	})

	const cardsViewAnimatedStyle = useAnimatedStyle(() => {
		return {
			minHeight: cardsViewHeight.value
		}
	})

	const [buttonDisabled, setButtonDisabled] = useState(true)
	const scaleFontSize = (size: number): number => {
		if (DeviceInfo.isTablet() || Platform.OS === 'web') {
			return size
		}
		const guidelineBaseWidth = 475
		return size * (window.width / guidelineBaseWidth)
	}
	const scaledHeading = scaleFontSize(33)
	const { styles } = useStyles(stylesheet)
	return (
		<>
			<View
				style={{
					...styles.page,
					paddingTop: insets.top + 20,
					paddingBottom: insets.bottom + 60
				}}
			>
				<View style={styles.logoTextGroup}>
					<Animated.View
						style={{
							...logoAnimatedStyle,
							...logoFadeOutAnimatedStyle
						}}
					>
						<LogoSVG size={160} />
					</Animated.View>

					<Animated.Text
						style={[
							{
								fontSize: scaledHeading,
								...styles.heading1
							},
							textAnimatedStyle
						]}
					>
						{t('onboarding.page1.title')}
					</Animated.Text>
					<AnimatedText
						speed={800}
						text="Neuland Next"
						disabled={!buttonDisabled}
						// @ts-expect-error wrong types
						textStyles={[
							{
								fontSize: scaledHeading,
								...styles.heading2
							},
							textAnimatedStyle
						]}
					/>
				</View>
				<Animated.View style={[styles.cardsContainer, cardsViewAnimatedStyle]}>
					<CardsElement />
				</Animated.View>

				<View style={styles.legalContainer}>
					<LegalArea />
				</View>
				<Animated.View
					style={[styles.fullLogoContainer, textLogoAnimatedStyle]}
				>
					<LogoTextSVG size={15} color={styles.heading1.color} />
				</Animated.View>
			</View>
			<Animated.View style={helpAnimatedStyle}>
				<Pressable
					onPress={() => {
						void Linking.openURL('https://neuland.app/docs/app/faq')
					}}
					style={{}}
				>
					<PlatformIcon
						style={styles.icon}
						ios={{
							name: 'questionmark.circle',
							size: 20,
							variableValue: 1
						}}
						android={{
							name: 'help',
							size: 25,
							variant: 'outlined'
						}}
						web={{
							name: 'CircleQuestionMark',
							size: 25
						}}
					/>
				</Pressable>
			</Animated.View>
		</>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	boxes: {
		gap: 12,
		marginHorizontal: 40
	},
	boxesContainer: {
		justifyContent: 'center',
		paddingTop: 20
	},
	button: {
		alignSelf: 'center',
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.md,
		paddingHorizontal: 24,
		paddingVertical: 14,
		width: '50%'
	},

	buttonText: {
		color: getContrastColor(theme.colors.primary),
		fontSize: 16,
		fontWeight: '700',
		textAlign: 'center'
	},
	cardsContainer: {
		flexGrow: 0.5
	},
	fullLogoContainer: {
		alignItems: 'center',
		bottom: 30,
		position: 'absolute',
		width: '100%'
	},

	heading1: {
		color: theme.colors.text,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	heading2: {
		color: theme.colors.text,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	icon: {
		color: theme.colors.labelSecondaryColor
	},
	legalContainer: {
		flex: 1,
		justifyContent: 'center',
		width: '95%'
	},
	linkPrivacy: {
		color: theme.colors.text,
		fontWeight: 'bold'
	},
	logoTextGroup: { flex: 1, justifyContent: 'center' },
	page: {
		alignItems: 'center',
		backgroundColor: theme.colors.contrast,
		flex: 1,
		marginHorizontal: 6
	},
	privacyRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center'
	},
	privacyText: {
		color: theme.colors.labelColor,
		flexWrap: 'wrap',
		flex: 1,
		flexShrink: 1,
		textAlign: 'center'
	}
}))
