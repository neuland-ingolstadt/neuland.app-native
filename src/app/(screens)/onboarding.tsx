import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import type React from 'react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	type ColorValue,
	Dimensions,
	Linking,
	Platform,
	Pressable,
	Text,
	View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Animated, {
	interpolate,
	type SharedValue,
	useAnimatedStyle
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'
import { OnboardingAmbient } from '@/components/Flow/onboarding-ambient'
import { OnboardingCard } from '@/components/Flow/onboarding-card'
import { OnboardingHero } from '@/components/Flow/onboarding-hero'
import LogoTextSVG from '@/components/Flow/svgs/logo-text'
import { useOnboardingSequence } from '@/components/Flow/use-onboarding-sequence'
import PlatformIcon from '@/components/Universal/icon'
import { PRIVACY_URL } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import type { OnboardingCardData } from '@/types/data'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

interface OnboardingContinueButtonProps {
	buttonTextColor: string
	disabled: boolean
	label: string
	onContinue: () => void
}

function OnboardingContinueButton({
	buttonTextColor,
	disabled,
	label,
	onContinue
}: OnboardingContinueButtonProps): React.JSX.Element {
	return (
		<Pressable
			className="self-center bg-primary rounded-md px-6 py-3.5 w-1/2"
			onPress={onContinue}
			disabled={disabled}
		>
			<Text
				className="text-base font-bold text-center"
				style={{ color: buttonTextColor }}
			>
				{label}
			</Text>
		</Pressable>
	)
}

interface OnboardingLegalAreaProps {
	buttonDisabled: boolean
	buttonTextColor: string
	continueLabel: string
	labelColor: ColorValue | undefined
	legalOpacity: SharedValue<number>
	legalTranslateY: SharedValue<number>
	onContinue: () => void
	privacyLabel: string
	agreePrefix: string
	agreeSuffix: string
	textColor: ColorValue | undefined
	windowHeight: number
	windowWidth: number
}

function OnboardingLegalArea({
	buttonDisabled,
	buttonTextColor,
	continueLabel,
	labelColor,
	legalOpacity,
	legalTranslateY,
	onContinue,
	privacyLabel,
	agreePrefix,
	agreeSuffix,
	textColor,
	windowHeight,
	windowWidth
}: OnboardingLegalAreaProps): React.JSX.Element {
	const legalAnimatedStyle = useAnimatedStyle(() => ({
		opacity: legalOpacity.value,
		transform: [{ translateY: legalTranslateY.value }]
	}))

	return (
		<Animated.View style={legalAnimatedStyle}>
			<View
				className="items-center flex-row justify-center"
				style={{
					marginBottom: windowHeight * 0.035,
					marginTop: windowHeight * 0.008
				}}
			>
				<Text
					className="flex-wrap flex-1 shrink text-center text-sm"
					style={{ color: labelColor, maxWidth: windowWidth }}
					numberOfLines={2}
				>
					<Text>{agreePrefix}</Text>
					<Text
						disabled={buttonDisabled}
						className="font-bold"
						style={{ color: textColor }}
						onPress={() => {
							void Linking.openURL(PRIVACY_URL)
						}}
					>
						{privacyLabel}
					</Text>
					<Text>{agreeSuffix}</Text>
				</Text>
			</View>
			<OnboardingContinueButton
				buttonTextColor={buttonTextColor}
				disabled={buttonDisabled}
				label={continueLabel}
				onContinue={onContinue}
			/>
		</Animated.View>
	)
}

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
	const insets = useSafeAreaInsets()
	const window = Dimensions.get('window')
	const [isWhobbleDisabled, setWhobbleDisabled] = useState(true)
	const [buttonDisabled, setButtonDisabled] = useState(true)

	const onCardsReady = useCallback(() => {
		setWhobbleDisabled(false)
	}, [])
	const onContinueReady = useCallback(() => {
		setButtonDisabled(false)
	}, [])

	const animation = useOnboardingSequence({ onCardsReady, onContinueReady })

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

	const heroAnimatedStyle = useAnimatedStyle(() => ({
		opacity: animation.heroOpacity.value,
		maxHeight: interpolate(animation.heroCollapse.value, [0, 1], [0, 420]),
		marginTop: interpolate(animation.heroCollapse.value, [0, 1], [0, 24]),
		marginBottom: interpolate(animation.heroCollapse.value, [0, 1], [0, 12]),
		overflow: 'hidden' as const,
		transform: [{ scale: animation.heroOpacity.value * 0.08 + 0.92 }]
	}))

	const textLogoAnimatedStyle = useAnimatedStyle(() => ({
		opacity: animation.textLogoOpacity.value
	}))

	const helpAnimatedStyle = useAnimatedStyle(() => ({
		position: 'absolute',
		top: insets.top + 15,
		right: 18,
		opacity: animation.helpOpacity.value
	}))

	const cardsViewAnimatedStyle = useAnimatedStyle(() => ({
		minHeight: animation.cardsViewHeight.value
	}))

	const handleContinue = (): void => {
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
	}

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
				className="items-center bg-contrast flex-1 mx-1.5 overflow-hidden"
				style={{
					paddingTop: insets.top + 20,
					paddingBottom: insets.bottom + 60
				}}
			>
				<OnboardingAmbient
					masterOpacity={animation.ambientOpacity}
					networkProgress={animation.networkProgress}
				/>

				<View className="flex-1 justify-center items-center">
					<Animated.View style={heroAnimatedStyle}>
						<OnboardingHero
							brandName="Neuland Next"
							fontSize={scaledHeading}
							heroProgress={animation.heroProgress}
							logoScale={animation.logoScale}
							rippleProgress={animation.rippleProgress}
							titleOpacity={animation.titleOpacity}
							titleTranslateY={animation.titleTranslateY}
							welcomeTitle={t('onboarding.page1.title')}
						/>
					</Animated.View>
				</View>

				<Animated.View className="grow-[0.5]" style={cardsViewAnimatedStyle}>
					<View className="justify-center pt-5 gap-3 mx-10">
						{data.map(({ title, description, icon }, index) => (
							<OnboardingCard
								key={title}
								title={title}
								description={description}
								icon={icon}
								opacity={animation.cardOpacities[index]}
								scale={animation.cardScales[index]}
								translateY={animation.cardTranslateYs[index]}
								wobbleDisabled={isWhobbleDisabled}
							/>
						))}
					</View>
				</Animated.View>

				<View className="flex-1 justify-center w-[95%]">
					<OnboardingLegalArea
						buttonDisabled={buttonDisabled}
						buttonTextColor={buttonTextColor}
						continueLabel={t('whatsnew.continue')}
						labelColor={labelColor}
						legalOpacity={animation.legalOpacity}
						legalTranslateY={animation.legalTranslateY}
						onContinue={handleContinue}
						privacyLabel={t('onboarding.links.privacy')}
						agreePrefix={t('onboarding.links.agree1')}
						agreeSuffix={t('onboarding.links.agree2')}
						textColor={textColor}
						windowHeight={window.height}
						windowWidth={window.width}
					/>
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
