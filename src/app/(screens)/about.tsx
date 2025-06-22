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
	StyleSheet,
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
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import FormList from '@/components/Universal/FormList'
import { linkIcon } from '@/components/Universal/Icon'
import SectionView from '@/components/Universal/SectionsView'
import SingleSectionPicker from '@/components/Universal/SingleSectionPicker'
import { PRIVACY_URL, STATUS_URL } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { FormListSections } from '@/types/components'

export default function About(): React.JSX.Element {
	const router = useRouter()
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['settings'])

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

	// Shimmer animation values
	const shimmerOpacity = useSharedValue(0)
	const shimmerPosition = useSharedValue(-100)
	const shimmerScale = useSharedValue(1)
	const shimmerRotation = useSharedValue(0)

	useEffect(() => {
		const animate = () => {
			shimmerPosition.value = -100
			shimmerOpacity.value = 0
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

	const sections: FormListSections[] = [
		{
			header: 'App',
			items: [
				{
					title: 'Version',
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
					title: 'Changelog',
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
					title: 'System Status',
					icon: {
						ios: 'bubble.left.and.exclamationmark.bubble.right',
						android: 'troubleshoot',
						web: 'HeartPulse'
					},
					onPress: () => {
						void Linking.openURL(STATUS_URL)
					}
				},
				{
					title: 'Member Area',
					icon: {
						ios: 'person.crop.circle.badge.checkmark',
						android: 'verified_user',
						web: 'UserCheck'
					},
					onPress: () => {
						router.navigate('/member')
					}
				}
			]
		},
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
					title: 'App Website',
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

	// Use useRef instead of useState to prevent re-renders
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

	const handleWebsitePress = (): void => {
		void Linking.openURL('https://neuland-ingolstadt.de/')
	}

	const handleContributorsPress = (): void => {
		const url = 'https://neuland.app/about/contributors'
		void Linking.openURL(url)
	}

	return (
		<ScrollView contentContainerStyle={styles.contentContainer}>
			<View style={styles.container}>
				<View style={styles.logoContainer}>
					<Pressable
						onPress={() => {
							if (Platform.OS !== 'web') {
								void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
							}
							handlePress()
						}}
					>
						<View style={styles.logoIcon}>
							<Image
								source={require('@/assets/appIcons/default.png')}
								alt="Neuland Next Logo"
								style={styles.logoImage}
							/>
							<Animated.View style={[styles.shimmer, shimmerStyle]} />
							<Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
						</View>
					</Pressable>

					<View style={styles.logoTextContainer}>
						<View style={styles.appTitleContainer}>
							<Text style={styles.header}>{'Neuland Next'}</Text>
							<Text style={styles.text}>
								{Platform.OS !== 'web' ? 'Native' : 'Native Web'}
								{(Application.applicationId?.endsWith('.dev') ?? false)
									? ' Dev'
									: ''}
								{' Version'}
							</Text>
						</View>
						<View>
							<Text style={styles.subHeader}>
								{t('about.header.developed')}
							</Text>
							<Pressable onPress={handleWebsitePress}>
								<Text style={styles.text} onPress={handleContributorsPress}>
									{'Neuland Ingolstadt e.V.'}
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.formlistContainer}>
				<FormList sections={sections} />
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
					selectedItem={analyticsAllowed ?? false}
					action={setAnalyticsAllowed}
					state={analyticsAllowed ?? false}
				/>
			</SectionView>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	appTitleContainer: {
		marginBottom: 10
	},
	container: {
		paddingBottom: 20,
		paddingTop: 30
	},
	contentContainer: {
		paddingBottom: theme.margins.bottomSafeArea
	},
	formlistContainer: {
		alignSelf: 'center',
		marginTop: 10,
		paddingHorizontal: theme.margins.page,
		width: '100%'
	},
	header: {
		color: theme.colors.text,
		fontSize: 22,
		fontWeight: 'bold'
	},
	logoContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 30,
		maxWidth: 600,
		alignSelf: 'center',
		width: '100%'
	},
	logoIcon: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 9,
		boxShadow: `4 4 10 0 ${theme.colors.labelTertiaryColor}`,
		overflow: 'hidden'
	},
	logoImage: {
		borderRadius: 9,
		flex: 1,
		height: 100,
		resizeMode: 'contain',
		width: 100
	},
	logoTextContainer: {
		flexDirection: 'column'
	},
	subHeader: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: 'bold'
	},
	text: {
		color: theme.colors.text,
		fontSize: 16
	},
	shimmer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
		transform: [{ skewX: '-20deg' }],
		width: '45%',
		zIndex: 1
	},
	shimmerOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255, 255, 255, 0.15)',
		transform: [{ skewX: '-20deg' }],
		width: '55%',
		zIndex: 2
	}
}))
