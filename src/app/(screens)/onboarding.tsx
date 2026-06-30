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
import { useCSSVariable } from 'uniwind'
import AnimatedText from '@/components/Flow/svgs/animated-text'
import LogoSVG from '@/components/Flow/svgs/logo'
import LogoTextSVG from '@/components/Flow/svgs/logo-text'
import WhatsNewBox from '@/components/Flow/whats-new-box'
import PlatformIcon from '@/components/Universal/icon'
import { PRIVACY_URL } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import type { OnboardingCardData } from '@/types/data'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function OnboardingScreen(): React.JSX.Element {
	const { t } = useTranslation('flow')
	const setOnboarded = useFlowStore((state) => state.setOnboarded)
	const toggleUpdated = useFlowStore((state) => state.toggleUpdated)
	const setAnalyticsAllowed = useFlowStore((state) => state.setAnalyticsAllowed)
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelColor = toColor(useCSSVariable('--color-label'))
	const labelSecondaryColor = toColor(useCSSVariable('--color-label-secondary'))
	const primaryColor = String(useCSSVariable('--color-primary') ?? '#007aff')
	const buttonTextColor = getContrastColor(primaryColor)

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
		return (
			<Pressable
				className="self-center bg-primary rounded-md px-6 py-3.5 w-1/2"
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
				<Text
					className="text-base font-bold text-center"
					style={{ color: buttonTextColor }}
				>
					{t('whatsnew.continue')}
				</Text>
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
		return (
			<Animated.View className="justify-center pt-5 gap-3 mx-10">
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
		return (
			<Animated.View style={legalAnimatedStyle}>
				<View
					className="items-center flex-row justify-center"
					style={{
						marginBottom: window.height * 0.035,
						marginTop: window.height * 0.008
					}}
				>
					<Text
						className="flex-wrap flex-1 shrink text-center text-sm"
						style={{ color: labelColor, maxWidth: window.width }}
						numberOfLines={2}
					>
						<Text>{t('onboarding.links.agree1')}</Text>
						<Text
							disabled={buttonDisabled}
							className="font-bold"
							style={{ color: textColor }}
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
	return (
		<>
			<View
				className="items-center bg-contrast flex-1 mx-1.5"
				style={{
					paddingTop: insets.top + 20,
					paddingBottom: insets.bottom + 60
				}}
			>
				<View className="flex-1 justify-center items-center">
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
								color: textColor,
								fontWeight: 'bold',
								textAlign: 'center'
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
								color: textColor,
								fontWeight: 'bold',
								textAlign: 'center'
							},
							textAnimatedStyle
						]}
					/>
				</View>
				<Animated.View className="grow-[0.5]" style={cardsViewAnimatedStyle}>
					<CardsElement />
				</Animated.View>

				<View className="flex-1 justify-center w-[95%]">
					<LegalArea />
				</View>
				<Animated.View
					className="items-center bottom-[30px] absolute w-full"
					style={textLogoAnimatedStyle}
				>
					<LogoTextSVG size={15} color={String(textColor)} />
				</Animated.View>
			</View>
			<Animated.View style={helpAnimatedStyle}>
				<Pressable
					onPress={() => {
						void Linking.openURL('https://neuland.app/docs/app/faq')
					}}
				>
					<PlatformIcon
						style={{ color: labelSecondaryColor }}
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
