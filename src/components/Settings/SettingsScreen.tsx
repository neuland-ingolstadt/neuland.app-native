import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import AnimatedLogoText from '@/components/Flow/svgs/AnimatedLogoText'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import FormList from '@/components/Universal/FormList'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/Icon'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { queryClient } from '@/components/provider'
import type { UserKindContextType } from '@/contexts/userKind'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { FormListSections } from '@/types/components'
import type { MaterialIcon } from '@/types/material-icons'
import {
	animatedHapticFeedback,
	useRandomColor,
	withBouncing
} from '@/utils/animation-utils'
import { getPersonalData, performLogout } from '@/utils/api-utils'
import { calculateECTS } from '@/utils/grades-utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import { loadSecureAsync, storage } from '@/utils/storage'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	LayoutAnimation,
	Linking,
	Platform,
	RefreshControl,
	ScrollView,
	Share,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { Pressable } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Animated, {
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import Avatar from './Avatar'
import GuestInfoSection from './GuestInfoSection'
import NameBox from './NameBox'
import StudentInfoSection from './StudentInfoSection'

export default function Settings(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { userKind = USER_GUEST } =
		useContext<UserKindContextType>(UserKindContext)
	const { resetOrder } = useContext(DashboardContext)
	const insets = useSafeAreaInsets()
	const windowView = Dimensions.get('window')
	const width = windowView.width - insets.left - insets.right
	const height = windowView.height - insets.top - insets.bottom
	const router = useRouter()
	const { t, i18n } = useTranslation(['settings'])
	const bottomBoundX = 0
	const logoWidth = 159
	const logoHeight = 15
	const topBoundX = width - logoWidth
	const [tapCount, setTapCount] = useState(0)
	const translateX = useSharedValue(0)
	const translateY = useSharedValue(0)
	const scrollY = useRef(0)
	const logoRotation = useSharedValue(0)
	const velocity = 110
	const [username, setUsername] = useState<string>('')
	const { color, randomizeColor } = useRandomColor()
	const resetPreferences = usePreferencesStore((state) => state.reset)
	const resetFood = useFoodFilterStore((state) => state.reset)
	const setLanguage = usePreferencesStore((state) => state.setLanguage)

	// Load employee username when component mounts
	useEffect(() => {
		const loadUsername = async (): Promise<void> => {
			if (userKind === USER_EMPLOYEE) {
				const loadedUsername = await loadSecureAsync('username')
				setUsername(loadedUsername ?? '')
			}
		}
		void loadUsername()
	}, [userKind])

	useEffect(() => {
		const { bottomBoundY, topBoundY } = getBounds()
		if (isBouncing) {
			trackEvent('EasterEgg', { easterEgg: 'settingsLogoBounce' })

			translateX.value = withBouncing(
				velocity,
				bottomBoundX,
				topBoundX,
				randomizeColor
			) as unknown as number
			translateY.value = withBouncing(
				velocity,
				bottomBoundY,
				topBoundY,
				randomizeColor
			) as unknown as number
		} else {
			cancelAnimation(translateX)
			cancelAnimation(translateY)
		}
	}, [tapCount])

	const logoBounceAnimation = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: translateX.value },
				{ translateY: translateY.value }
			]
		}
	})

	const wobbleAnimation = useAnimatedStyle(() => {
		return {
			transform: [{ rotateZ: `${logoRotation.value}deg` }]
		}
	})

	const getBounds = (): { topBoundY: number; bottomBoundY: number } => {
		const topBoundY = height - logoHeight + scrollY.current - 5
		const bottomBoundY = scrollY.current
		return { topBoundY, bottomBoundY }
	}

	const languageAlert = (): void => {
		const newLocale = i18n.language === 'en' ? 'de' : 'en'
		if (Platform.OS === 'web') {
			if (!window.confirm(t('menu.formlist.language.message'))) {
				/* empty */
			} else {
				setLanguage(newLocale)
				void i18n.changeLanguage(newLocale)
			}
		} else {
			Alert.alert(
				t('menu.formlist.language.title'),
				t('menu.formlist.language.message'),
				[
					{
						text: t('profile.logout.alert.cancel'),
						style: 'default'
					},
					{
						text: t('menu.formlist.language.confirm'),
						style: 'destructive',
						onPress: () => {
							storage.set('language', newLocale)
							void i18n.changeLanguage(newLocale)
						}
					}
				]
			)
		}
	}

	const logoutAlert = (): void => {
		Alert.alert(
			t('profile.logout.alert.title'),
			t('profile.logout.alert.message'),
			[
				{
					text: t('profile.logout.alert.cancel'),
					style: 'cancel'
				},
				{
					text: t('profile.logout.alert.confirm'),
					style: 'destructive',
					onPress: () => {
						resetPreferences()
						resetFood()
						performLogout(toggleUserKind, resetOrder, queryClient).catch(
							(e) => {
								console.log(e)
							}
						)
					}
				}
			]
		)
	}

	const { data, error, isLoading, isSuccess, refetch, isError } = useQuery({
		queryKey: ['personalData'],
		queryFn: getPersonalData,
		staleTime: 1000 * 60 * 60 * 12,
		gcTime: 1000 * 60 * 60 * 24 * 60,
		retry(failureCount, error) {
			if (error instanceof NoSessionError) {
				router.replace('/login')
				return false
			}
			if (userKind !== 'student') {
				return false
			}
			return failureCount < 2
		},
		enabled: userKind === USER_STUDENT
	})

	const { data: ects } = useQuery({
		queryKey: ['ects'],
		queryFn: calculateECTS,
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		enabled: userKind === USER_STUDENT
	})

	// Query for personal lecturers
	const { data: personalLecturers } = useQuery({
		queryKey: ['personalLecturers'],
		queryFn: async () => {
			const rawData = await API.getPersonalLecturers()
			const normalizedData = normalizeLecturers(rawData)
			return normalizedData
		},
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
		retry(failureCount, error) {
			if (error instanceof NoSessionError) {
				router.replace('/login')
				return false
			}
			if (userKind !== 'student') {
				return false
			}
			return failureCount < 2
		},
		select: (data) => data.length,
		enabled: userKind === USER_STUDENT
	})

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

	const { toggleUserKind } = React.useContext(UserKindContext)
	const handlePress = (): void => {
		setTapCount(tapCount + 1)
		animatedHapticFeedback()
		if (tapCount < 1) {
			const rotationDegree = 5

			logoRotation.value = withSequence(
				withTiming(-rotationDegree, { duration: 50 }),
				withTiming(rotationDegree, { duration: 100 }),
				withTiming(0, { duration: 50 })
			)
		}
	}

	useEffect(() => {
		if (isLoading || isSuccess) {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		}
	}, [isLoading, isSuccess])

	const isBouncing = tapCount === 2

	const sections: FormListSections[] = [
		{
			header: t('menu.formlist.preferences.title'),
			items: [
				{
					title: 'Dashboard',
					icon: {
						ios: 'rectangle.stack',
						android: 'dashboard_customize',
						web: 'LayoutDashboard'
					},

					onPress: () => {
						router.navigate('/dashboard')
					}
				},
				{
					title: t('menu.formlist.preferences.food'),
					icon: {
						android: 'restaurant',
						ios: 'fork.knife',
						web: 'Utensils'
					},
					onPress: () => {
						router.navigate('/food-preferences')
					}
				},
				{
					title: t('menu.formlist.preferences.timetable'),
					icon: {
						ios: 'calendar',
						android: 'event',
						web: 'Calendar'
					},
					onPress: () => {
						router.navigate('/timetable-preferences')
					}
				},
				{
					title: t('menu.formlist.preferences.language'),
					icon: {
						ios: 'globe',
						android: 'language',
						web: 'Globe'
					},

					onPress: async () => {
						if (
							Platform.OS === 'ios' ||
							(Platform.OS === 'android' && Platform.Version >= 33)
						) {
							await Linking.openSettings()
						} else {
							languageAlert()
						}
					}
				}
			]
		},
		{
			header: t('menu.formlist.appearance.title'),
			items: [
				{
					title: t('menu.formlist.appearance.accent'),
					icon: {
						ios: 'paintpalette',
						android: 'palette',
						web: 'Palette'
					},
					onPress: () => {
						router.navigate('/accent')
					}
				},
				{
					title: t('menu.formlist.appearance.theme'),
					icon: {
						ios: 'moon.stars',
						android: 'routine',
						web: 'MoonStar'
					},
					onPress: () => {
						router.navigate('/theme')
					}
				},
				...(Platform.OS === 'ios' && DeviceInfo.getDeviceType() !== 'Desktop'
					? [
							{
								title: 'App Icon',
								icon: {
									ios: 'star.square.on.square',
									android: '' as MaterialIcon,
									web: 'StarSquare' as LucideIcon
								},
								onPress: () => {
									router.navigate('/app-icon')
								}
							}
						]
					: [])
			]
		},
		{
			header: t('menu.formlist.legal.title'),
			items: [
				{
					title: t('menu.formlist.legal.about'),
					icon: {
						ios: 'info.circle',
						android: 'info',
						web: 'Info'
					},
					onPress: () => {
						router.navigate('/about')
					}
				},
				{
					title: t('menu.formlist.legal.share'),
					icon: {
						ios: 'square.and.arrow.up',
						android: 'share',
						web: 'Share'
					},
					onPress: () => {
						trackEvent('Share', { type: 'app' })

						void Share.share({
							url: 'https://next.neuland.app/get', // url option is only available on iOS
							message:
								Platform.OS === 'ios'
									? t('menu.formlist.legal.shareMessage')
									: t('menu.formlist.legal.shareMessageAndroid')
						})
					}
				},
				...(Platform.OS === 'web'
					? [
							{
								title: t('menu.formlist.legal.download'),
								icon: {
									ios: 'square.and.arrow.up',
									android: 'share' as MaterialIcon,
									web: 'Download' as LucideIcon
								},
								onPress: () => {
									void Linking.openURL('https://next.neuland.app/get')
								}
							}
						]
					: [])
			]
		}
	]

	const logoInactiveOpacity = isBouncing ? 0 : 1
	const logoActiveOpacity = isBouncing ? 1 : 0
	const logoActiveHeight = isBouncing ? 18 : 0

	return (
		<ScrollView
			refreshControl={
				isError && userKind === 'student' ? (
					<RefreshControl
						refreshing={isRefetchingByUser}
						onRefresh={() => {
							void refetchByUser()
						}}
					/>
				) : undefined
			}
			onScroll={(event) => {
				scrollY.current = event.nativeEvent.contentOffset.y
				setTapCount(0)
			}}
			scrollEventThrottle={16}
			contentInsetAdjustmentBehavior="automatic"
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.wrapper}>
				{userKind === 'student' ? (
					<View style={styles.container}>
						<Pressable
							onPress={() => {
								router.navigate('/profile')
							}}
							// Keep the white background and rounded top corners
							style={{
								borderRadius: theme.radius.mg,
								overflow: 'hidden'
							}}
						>
							<View style={styles.nameBox}>
								{isSuccess && data?.mtknr !== undefined ? (
									<View style={styles.nameOuterContainer}>
										<View style={styles.nameInnerContainer}>
											<NameBox
												title={`${data?.vname} ${data?.name}`}
												subTitle1={`${data?.stgru ?? ''}. Semester`}
												subTitle2={data?.fachrich ?? ''}
												showChevron={true}
											>
												<Avatar background={`${theme.colors.primary}25`}>
													<Text
														style={StyleSheet.compose(styles.avatarText, {
															color: theme.colors.primary
														})}
													>
														{getInitials(`${data?.vname} ${data?.name}`)}
													</Text>
												</Avatar>
											</NameBox>
										</View>
									</View>
								) : isSuccess ? (
									<View style={styles.nameOuterContainer}>
										<View style={styles.nameInnerContainer}>
											<NameBox
												title={t('menu.error.noData.title')}
												subTitle1={t('menu.error.noData.subtitle1')}
												subTitle2={t('menu.error.noData.subtitle2')}
												showChevron={true}
											>
												<Avatar
													background={`${theme.colors.labelTertiaryColor}25`}
												>
													<PlatformIcon
														ios={{
															name: 'exclamationmark.triangle',
															variant: 'fill',
															size: 26
														}}
														android={{ name: 'warning', size: 28 }}
														web={{ name: 'TriangleAlert', size: 28 }}
														style={{
															...styles.iconGuest,
															color: theme.colors.labelTertiaryColor
														}}
													/>
												</Avatar>
											</NameBox>
										</View>
									</View>
								) : isLoading ? (
									<View style={styles.nameOuterContainer}>
										<View style={styles.nameInnerContainer}>
											<ActivityIndicator style={styles.loading} />
										</View>
									</View>
								) : (
									<View style={styles.nameOuterContainer}>
										<View style={styles.nameInnerContainer}>
											<NameBox
												title="Error"
												subTitle1={error?.message ?? 'Unknown error'}
												subTitle2={t('menu.error.subtitle2')}
											>
												<Avatar
													background={`${theme.colors.labelTertiaryColor}25`}
												>
													<PlatformIcon
														ios={{
															name: 'exclamationmark.triangle',
															variant: 'fill',
															size: 26
														}}
														android={{ name: 'warning', size: 28 }}
														web={{ name: 'TriangleAlert', size: 28 }}
														style={{
															...styles.iconGuest,
															color: theme.colors.labelTertiaryColor
														}}
													/>
												</Avatar>
											</NameBox>
										</View>
									</View>
								)}
							</View>
						</Pressable>
					</View>
				) : (
					<Pressable
						onPress={() => {
							if (userKind === 'employee') {
								logoutAlert()
							} else {
								if (userKind === 'guest') {
									router.navigate('/login')
								}
							}
						}}
						style={styles.container}
					>
						<View style={styles.nameBox}>
							{userKind === 'employee' ? (
								<View style={styles.nameInnerContainer}>
									<NameBox
										title={username as string}
										subTitle1={t('menu.employee.subtitle1')}
										subTitle2={t('menu.employee.subtitle2')}
									>
										<Avatar background={`${theme.colors.primary}25`}>
											<Text
												style={StyleSheet.compose(styles.avatarText, {
													color: theme.colors.primary
												})}
											>
												{getInitials((username as string) ?? '')}
											</Text>
										</Avatar>
									</NameBox>
								</View>
							) : (
								<View style={styles.nameInnerContainer}>
									<NameBox
										title={t('menu.guest.title')}
										subTitle1={t('menu.guest.subtitle')}
										subTitle2={''}
										showChevron={true}
									>
										<Avatar background={`${theme.colors.primary}25`}>
											<PlatformIcon
												ios={{ name: 'person', variant: 'fill', size: 26 }}
												android={{ name: 'account_circle', size: 32 }}
												web={{ name: 'User', size: 32 }}
												style={{
													...styles.iconGuest,
													color: theme.colors.primary
												}}
											/>
										</Avatar>
									</NameBox>
								</View>
							)}
						</View>
					</Pressable>
				)}

				<View style={styles.infoBoxesSection}>
					{userKind === USER_GUEST ? (
						<GuestInfoSection />
					) : userKind === USER_STUDENT ? (
						<StudentInfoSection
							ects={ects}
							printerBalance={data?.pcounter}
							personalLecturersCount={personalLecturers}
						/>
					) : (
						<></>
					)}
				</View>

				<View style={styles.formlistContainer}>
					<FormList sections={sections} />
				</View>
			</View>

			<Text style={styles.copyright}>
				{t('menu.copyright', { year: new Date().getFullYear() })}
			</Text>
			{Platform.OS !== 'web' && (
				<>
					<Animated.View
						style={[
							styles.bounceContainer,
							logoBounceAnimation,

							{
								opacity: logoActiveOpacity,
								height: logoActiveHeight
							}
						]}
					>
						<Pressable
							onPress={() => {
								setTapCount(0)
							}}
							disabled={!isBouncing}
							hitSlop={{
								top: 10,
								right: 10,
								bottom: 10,
								left: 10
							}}
						>
							<LogoTextSVG
								size={15}
								color={isBouncing ? color : theme.colors.text}
							/>
						</Pressable>
					</Animated.View>

					<Animated.View
						style={[
							wobbleAnimation,
							styles.whobbleContainer,
							{
								opacity: logoInactiveOpacity
							}
						]}
					>
						<Pressable
							onPress={() => {
								handlePress()
							}}
							disabled={isBouncing}
							accessibilityLabel={t('button.settingsLogo', {
								ns: 'accessibility'
							})}
							hitSlop={{
								top: 10,
								right: 10,
								bottom: 10,
								left: 10
							}}
						>
							<AnimatedLogoText
								dimensions={{
									logoWidth,
									logoHeight
								}}
								speed={3.5}
							/>
						</Pressable>
					</Animated.View>
				</>
			)}
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	avatarText: {
		fontSize: 20,
		fontWeight: 'bold'
	},
	bounceContainer: {
		position: 'absolute',
		zIndex: 10
	},
	container: {
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.mg,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		width: '100%',
		marginTop: 12
	},
	contentContainer: {
		paddingBottom: 60
	},
	copyright: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 12,
		marginBottom: -10,
		marginTop: 20,
		textAlign: 'center'
	},
	formlistContainer: { marginVertical: 16, marginTop: 24 },
	iconAlign: {
		alignSelf: 'center',
		color: theme.colors.labelSecondaryColor
	},
	iconGuest: {
		color: 'white',
		marginTop: Platform.OS === 'android' ? 2 : 0
	},
	infoBoxesSection: {
		marginTop: 16
	},
	infoBoxesContainer: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 10
	},
	loading: {
		alignItems: 'center',
		flexDirection: 'row',
		flex: 1,
		justifyContent: 'center',
		marginVertical: 25
	},
	nameBox: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	nameInnerContainer: {
		flexDirection: 'row',
		paddingVertical: 12,
		width: '100%'
	},
	nameOuterContainer: { flexDirection: 'column', flex: 1 },

	whobbleContainer: {
		alignItems: 'center',
		paddingTop: 20
	},
	wrapper: { paddingHorizontal: 12 },
	guestBanner: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.mg,
		padding: 20,
		marginVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 16
	},
	guestBannerContent: {
		flex: 1
	},
	guestBannerTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4
	},
	guestBannerMessage: {
		color: theme.colors.labelColor,
		fontSize: 13,
		lineHeight: 18
	},
	guestBannerIcon: {
		color: theme.colors.labelSecondaryColor
	},
	guestBannerButton: {
		backgroundColor: theme.colors.primary,
		borderRadius: theme.radius.sm,
		paddingVertical: 8,
		paddingHorizontal: 16,
		minWidth: 100,
		alignItems: 'center'
	},
	guestBannerButtonText: {
		color: getContrastColor(theme.colors.primary),
		fontSize: 14,
		fontWeight: '500'
	}
}))
