import { trackEvent } from '@aptabase/react-native'
import { router, usePathname } from 'expo-router'
import type React from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useSessionStore } from '@/hooks/useSessionStore'
import type { MaterialIcon } from '@/types/material-icons'
import {
	guestError,
	networkError,
	notLoggedInError,
	permissionError
} from '@/utils/api-utils'

import PlatformIcon, { type LucideIcon } from '../Universal/icon'
import StatusBox from './action-box'

function handleErrorButtonPress(
	errorTitle: string,
	onButtonPress?: () => void
): void {
	switch (errorTitle) {
		case guestError || notLoggedInError:
			router.navigate('/login')
			break
		default:
			if (onButtonPress != null) {
				onButtonPress()
			}
			break
	}
}

export default function ErrorView({
	title,
	message,
	buttonText,
	icon,
	onButtonPress,
	onRefresh,
	refreshing,
	showPullLabel,
	inModal = false,
	isCritical = true
}: {
	title: string
	message?: string
	icon?: {
		ios: string
		android: MaterialIcon
		web: LucideIcon
		multiColor?: boolean
	}
	buttonText?: string
	onButtonPress?: () => void
	onRefresh?: () => unknown
	refreshing?: boolean
	showPullLabel?: boolean
	inModal?: boolean
	isCritical?: boolean
}): React.JSX.Element {
	const { t } = useTranslation('common')
	const path = usePathname()
	const analyticsInitialized = useSessionStore(
		(state) => state.analyticsInitialized
	)

	const getIconIos = (): string => {
		switch (title) {
			case networkError:
				return 'wifi.slash'
			case guestError:
				return 'person.crop.circle.badge.questionmark'
			case permissionError:
				return 'person.crop.circle.badge.exclamationmark'
			default:
				return icon !== undefined ? icon.ios : 'exclamationmark.triangle.fill'
		}
	}

	const getIconAndroid = (): MaterialIcon => {
		switch (title) {
			case networkError:
				return 'wifi_off'
			case guestError:
				return 'person_cancel'
			case permissionError:
				return 'person_alert'
			default:
				return icon !== undefined ? icon.android : 'error'
		}
	}

	const shouldTrack =
		!(
			networkError === title ||
			guestError === title ||
			permissionError === title
		) && isCritical

	const showBox = !inModal && shouldTrack

	useEffect(() => {
		if (!analyticsInitialized || !shouldTrack) return
		trackEvent('ErrorView', {
			title,
			path,
			crash: false
		})
	}, [analyticsInitialized, shouldTrack, title, path])

	const getTitle = (): string => {
		switch (title) {
			case networkError:
				return t('error.network.title')
			case guestError:
				return t('error.guest.title')
			case permissionError:
				return t('error.permission.title')
			default:
				return title
		}
	}

	const getMessage = (): string => {
		switch (title) {
			case networkError:
				return t('error.network.description')
			case guestError:
				return t('error.guest.description')
			case permissionError:
				return t('error.permission.description')
			case notLoggedInError:
				return t('error.notLoggedIn.description')
			default:
				if (message != null) {
					return message
				}
				return t('error.description')
		}
	}

	const ErrorButton = (): React.JSX.Element => {
		let buttonProps = null

		if (title === guestError || title === notLoggedInError) {
			buttonProps = {
				onPress: () => {
					router.navigate('/login')
				},
				text: t('error.guest.button')
			}
		} else if (onButtonPress != null && buttonText === undefined) {
			buttonProps = {
				onPress: () => {
					handleErrorButtonPress(title, onButtonPress)
				},
				text: t('error.button')
			}
		} else if (onButtonPress != null && buttonText !== undefined) {
			buttonProps = {
				onPress: () => {
					handleErrorButtonPress(title, onButtonPress)
				},
				text: buttonText
			}
		}

		return (buttonProps != null ||
			title === guestError ||
			title === notLoggedInError) &&
			title !== permissionError ? (
			<Pressable
				className={`mt-[30px] mb-5 self-center items-center rounded-mg ${inModal ? 'bg-background' : 'bg-card'}`}
				onPress={buttonProps?.onPress}
			>
				<View className="flex-row items-center px-10 py-2.5">
					<Text className="text-base font-semibold text-primary">
						{buttonProps?.text}
					</Text>
				</View>
			</Pressable>
		) : (
			// biome-ignore lint/complexity/noUselessFragments: okay here
			<></>
		)
	}

	const scrollContentClassName = inModal
		? 'flex-1 px-[25px] pb-[25px] bg-card rounded-ios pt-[25px]'
		: `flex-1 px-[25px] ${Platform.OS === 'ios' ? 'pb-[50px]' : ''}`

	return (
		<ScrollView
			refreshControl={
				refreshing != null &&
				title !== guestError &&
				title !== notLoggedInError ? (
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				) : undefined
			}
			scrollEnabled={!inModal}
			contentContainerClassName={scrollContentClassName}
		>
			<Animated.View
				entering={FadeIn.duration(400)}
				className="flex-1 items-center justify-evenly gap-3 p-5"
			>
				<View className="items-center gap-5">
					<PlatformIcon
						ios={{
							name: getIconIos(),
							size: 50,
							...((icon?.multiColor ?? false)
								? { renderMode: 'multicolor', variableValue: 1 }
								: {})
						}}
						android={{
							name: getIconAndroid(),
							size: 64
						}}
						web={{
							name: icon?.web ?? 'TriangleAlert',
							size: 64
						}}
					/>
					<Text
						className="my-2 text-center text-xl font-bold text-text"
						selectable
					>
						{getTitle().slice(0, 150)}
					</Text>
					<Text className="mt-3 text-center text-base font-medium text-text">
						{getMessage()}
					</Text>
				</View>

				<ErrorButton />
				{(refreshing != null && title !== guestError) ||
				showPullLabel === true ? (
					<Text className="mt-4 text-center text-base font-semibold text-text">
						{t('error.pull')}
					</Text>
				) : null}
				{showBox && <StatusBox error={new Error(title)} crash={false} />}
			</Animated.View>
		</ScrollView>
	)
}
