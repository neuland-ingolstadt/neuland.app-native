import { trackEvent } from '@aptabase/react-native'
import { alert } from 'burnt'
import * as Application from 'expo-application'
import Constants from 'expo-constants'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	Image,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View
} from 'react-native'
import Animated, {
	cancelAnimation,
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { MemberAreaButton } from '@/components/Member/member-area-button'
import FormList from '@/components/Universal/form-list'
import { linkIcon } from '@/components/Universal/icon'
import SectionView from '@/components/Universal/sections-view'
import SingleSectionPicker from '@/components/Universal/single-section-picker'
import { PRIVACY_URL, STATUS_URL } from '@/data/constants'
import { useMemberStore } from '@/hooks'
import { useFlowStore } from '@/hooks/useFlowStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import type { FormListSections } from '@/types/components'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

function handleWebsitePress(): void {
	void Linking.openURL('https://neuland-ingolstadt.de/')
}

function handleContributorsPress(): void {
	void Linking.openURL('https://neuland.app/about/contributors')
}

export default function About(): React.JSX.Element {
	const router = useRouter()
	const { t } = useTranslation(['settings'])
	const headerPadding = useTransparentHeaderPadding()
	const memberInfo = useMemberStore((s) => s.info)
	const labelTertiaryColor = String(
		toColor(useCSSVariable('--color-label-tertiary')) ?? '#99999a'
	)

	const analyticsAllowed = useFlowStore((state) => state.analyticsAllowed)
	const setAnalyticsAllowed = useFlowStore((state) => state.setAnalyticsAllowed)

	const unlockedAppIcons = usePreferencesStore(
		(state) => state.unlockedAppIcons
	)
	const addUnlockedAppIcon = usePreferencesStore(
		(state) => state.addUnlockedAppIcon
	)
	const version =
		Application.nativeApplicationVersion ??
		Constants.expoConfig?.version ??
		'unknown'

	const shimmerOpacity = useSharedValue(0)
	const shimmerPosition = useSharedValue(-100)
	const shimmerScale = useSharedValue(1)
	const shimmerRotation = useSharedValue(0)

	useEffect(() => {
		const animate = () => {
			shimmerOpacity.value = 0
			shimmerPosition.value = -100
			shimmerScale.value = 1
			shimmerRotation.value = 0

			shimmerOpacity.value = withSequence(
				withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
				withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
			)

			shimmerPosition.value = withTiming(200, {
				duration: 2400,
				easing: Easing.inOut(Easing.ease)
			})

			shimmerScale.value = withSequence(
				withTiming(1.1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
				withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
			)

			shimmerRotation.value = withTiming(25, {
				duration: 2400,
				easing: Easing.inOut(Easing.ease)
			})
		}

		animate()

		const interval = setInterval(animate, 8000)

		return () => {
			clearInterval(interval)
			cancelAnimation(shimmerOpacity)
			cancelAnimation(shimmerPosition)
			cancelAnimation(shimmerScale)
			cancelAnimation(shimmerRotation)
		}
	}, [])

	const shimmerStyle = useAnimatedStyle(() => {
		return {
			opacity: shimmerOpacity.value,
			transform: [
				{ translateX: shimmerPosition.value },
				{ scale: shimmerScale.value },
				{ rotate: `${shimmerRotation.value}deg` }
			]
		}
	})

	const appSection: FormListSections = {
		header: t('about.formlist.app.title'),
		items: [
			{
				title: t('about.formlist.app.version'),
				icon: {
					ios: 'info.circle',
					android: 'info',
					web: 'Info'
				},
				layout: 'row',
				value: version,
				onPress: () => {
					router.navigate('/version')
				}
			},
			{
				title: t('about.formlist.app.changelog'),
				icon: {
					ios: 'list.bullet.rectangle',
					android: 'article',
					web: 'FileText'
				},
				onPress: () => {
					router.navigate('/changelog')
				}
			},
			{
				title: t('about.formlist.systemStatus'),
				icon: {
					ios: 'bubble.left.and.exclamationmark.bubble.right',
					android: 'troubleshoot',
					web: 'HeartPulse'
				},
				onPress: () => {
					void Linking.openURL(STATUS_URL)
				}
			}
		]
	}

	const remainingSections: FormListSections[] = [
		{
			header: t('about.formlist.contact.title'),
			items: [
				{
					title: t('about.formlist.contact.feedback'),
					icon: {
						ios: 'envelope',
						android: 'mail',
						web: 'Mail'
					},
					onPress: async () =>
						(await Linking.openURL(
							'mailto:feedback@neuland.app?subject=Feedback%20Neuland-Next'
						)) as Promise<void>
				},
				{
					title: t('about.formlist.appWebsite'),
					icon: linkIcon,
					onPress: async () =>
						(await Linking.openURL('https://neuland.app')) as Promise<void>
				},
				...(Platform.OS === 'ios' || Platform.OS === 'android'
					? [
							{
								title:
									Platform.OS === 'ios'
										? t('about.formlist.contact.rateiOS')
										: t('about.formlist.contact.rateAndroid'),
								icon: {
									ios: 'star' as const,
									android: 'star' as const,
									web: 'Star' as const
								},
								onPress: () => {
									if (Platform.OS === 'android') {
										void Linking.openURL(
											'market://details?id=app.neuland&showAllReviews=true'
										)
									} else {
										void Linking.openURL(
											'itms-apps://apps.apple.com/app/neuland-next/id1617096811?action=write-review'
										)
									}
								}
							}
						]
					: [])
			]
		},

		{
			header: t('about.formlist.legal.title'),
			items: [
				{
					title: t('about.formlist.legal.button'),
					icon: {
						ios: 'hand.raised',
						android: 'privacy_tip',
						web: 'ShieldEllipsis'
					},
					onPress: () => {
						router.navigate('/legal')
					}
				}
			]
		}
	]

	const pressCountRef = useRef(0)

	const handlePress = useCallback((): void => {
		pressCountRef.current += 1

		if (pressCountRef.current === 7) {
			if (Platform.OS !== 'web') {
				Alert.alert(
					t('about.easterEgg.title'),
					Platform.OS === 'ios'
						? t('about.easterEgg.message')
						: t('about.easterEgg.messageAndroid'),
					[
						{
							text: t('about.easterEgg.confirm'),
							style: 'cancel'
						}
					],
					{ cancelable: false }
				)
			} else {
				alert({
					title: t('about.easterEgg.title'),
					message: t('about.easterEgg.messageAndroid'),
					preset: 'done'
				})
			}
			const isCollected = unlockedAppIcons.includes('cat')
			if (!isCollected) {
				trackEvent('EasterEgg', { easterEgg: 'aboutLogo' })
				if (Platform.OS === 'ios') addUnlockedAppIcon('cat')
			}

			pressCountRef.current = 0
		}
	}, [t, unlockedAppIcons, addUnlockedAppIcon])

	return (
		<ScrollView
			contentContainerClassName="pb-bottom-safe"
			style={{ paddingTop: headerPadding }}
		>
			<View className="pb-5 pt-[30px]">
				<View className="items-center flex-row justify-center gap-[30px] max-w-[600px] self-center w-full">
					<Pressable
						onPress={() => {
							if (Platform.OS !== 'web') {
								void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
							}
							handlePress()
						}}
					>
						<View
							className="bg-card border-border rounded-[18px] overflow-hidden"
							style={[
								hairlineBorder,
								{ boxShadow: `4 4 10 0 ${labelTertiaryColor}` }
							]}
						>
							<Image
								source={require('@/assets/appIcons/default.png')}
								alt="Neuland Next Logo"
								className="flex-1 h-[100px] w-[100px]"
								style={{ resizeMode: 'contain' }}
							/>
							<Animated.View
								className="absolute inset-0 w-[45%] z-[1]"
								style={[
									{
										backgroundColor: 'rgba(255, 255, 255, 0.3)',
										transform: [{ skewX: '-20deg' }]
									},
									shimmerStyle
								]}
							/>
							<Animated.View
								className="absolute inset-0 w-[55%] z-[2]"
								style={[
									{
										backgroundColor: 'rgba(255, 255, 255, 0.15)',
										transform: [{ skewX: '-20deg' }]
									},
									shimmerStyle
								]}
							/>
						</View>
					</Pressable>

					<View className="flex-col">
						<View className="mb-2.5">
							<Text className="text-text text-[22px] font-bold">
								{'Neuland Next'}
							</Text>
							<Text className="text-text text-base">
								{Platform.OS !== 'web' ? 'Native' : 'Native Web'}
								{(Application.applicationId?.endsWith('.dev') ?? false)
									? ' Dev'
									: ''}
								{' Version'}
							</Text>
						</View>
						<View>
							<Text className="text-text text-base font-bold">
								{t('about.header.developed')}
							</Text>
							<Pressable onPress={handleWebsitePress}>
								<Text
									className="text-text text-base"
									onPress={handleContributorsPress}
								>
									{'Neuland Ingolstadt e.V.'}
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</View>

			<View className="self-center gap-4 mt-2.5 px-page w-full">
				<FormList sections={[appSection]} />
				{!memberInfo && <MemberAreaButton />}
				<FormList sections={remainingSections} />
			</View>
			<SectionView
				title={t('about.analytics.title')}
				footer={t('about.analytics.message')}
				link={{
					text: t('about.analytics.link'),
					destination: () => {
						void Linking.openURL(`${PRIVACY_URL}#Analytics`)
					}
				}}
			>
				<SingleSectionPicker
					title={t('about.analytics.toggle')}
					selectedItem={analyticsAllowed === true}
					action={setAnalyticsAllowed}
				/>
			</SectionView>
		</ScrollView>
	)
}
