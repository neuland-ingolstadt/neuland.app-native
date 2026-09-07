import { trackEvent } from '@aptabase/react-native'
import { router, usePathname } from 'expo-router'
import type React from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Linking,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { STATUS_URL } from '@/data/constants'
import { useServiceStatus } from '@/hooks/useServiceStatus'
import { useSessionStore } from '@/hooks/useSessionStore'
import type { MaterialIcon } from '@/types/material-icons'
import {
	guestError,
	networkError,
	notLoggedInError,
	permissionError
} from '@/utils/api-utils'
import { matchesServiceOutage, type ServiceStatus } from '@/utils/gatus-status'
import PlatformIcon, { type LucideIcon } from '../Universal/icon'
import StatusBox from './action-box'

function handleErrorButtonPress(
	errorTitle: string,
	onButtonPress?: () => void
): void {
	if (errorTitle === guestError || errorTitle === notLoggedInError) {
		router.navigate('/login')
		return
	}

	if (onButtonPress != null) {
		onButtonPress()
	}
}

interface ErrorActionButtonProps {
	title: string
	buttonText?: string
	onButtonPress?: () => void
	inModal: boolean
	isConfirmedOutage: boolean
}

function ErrorActionButton({
	title,
	buttonText,
	onButtonPress,
	inModal,
	isConfirmedOutage
}: ErrorActionButtonProps): React.JSX.Element | null {
	const { t } = useTranslation('common')

	let buttonProps: { onPress: () => void; text: string } | null = null

	if (isConfirmedOutage) {
		buttonProps = {
			onPress: () => {
				void Linking.openURL(STATUS_URL)
			},
			text: t('error.crash.status')
		}
	} else if (title === guestError || title === notLoggedInError) {
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

	if (buttonProps == null || title === permissionError) {
		return null
	}

	return (
		<Pressable
			className={`mt-[30px] mb-5 self-center items-center rounded-mg ${inModal ? 'bg-background' : 'bg-card'}`}
			onPress={buttonProps.onPress}
		>
			<View className="flex-row items-center px-10 py-2.5">
				<Text className="text-base font-semibold text-primary">
					{buttonProps.text}
				</Text>
			</View>
		</Pressable>
	)
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
	isCritical = true,
	statusServices
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
	/** Only upgrade networkError when one of these Gatus services is down. */
	statusServices?: ServiceStatus | readonly ServiceStatus[]
}): React.JSX.Element {
	const { t } = useTranslation('common')
	const path = usePathname()
	const analyticsInitialized = useSessionStore(
		(state) => state.analyticsInitialized
	)
	const { isServiceDown } = useServiceStatus()
	const isConfirmedOutage =
		title === networkError &&
		matchesServiceOutage(isServiceDown, statusServices)

	const getIconIos = (): string => {
		if (isConfirmedOutage) {
			return 'personalhotspot.slash'
		}
		switch (title) {
			case networkError:
				return 'wifi.slash'
			case guestError:
			case notLoggedInError:
				return 'person.crop.circle.badge.questionmark'
			case permissionError:
				return 'person.crop.circle.badge.exclamationmark'
			default:
				return icon !== undefined ? icon.ios : 'exclamationmark.triangle.fill'
		}
	}

	const getIconAndroid = (): MaterialIcon => {
		if (isConfirmedOutage) {
			return 'cloud_off'
		}
		switch (title) {
			case networkError:
				return 'wifi_off'
			case guestError:
			case notLoggedInError:
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
			notLoggedInError === title ||
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
		if (isConfirmedOutage) {
			return t('error.network.outageTitle')
		}
		switch (title) {
			case networkError:
				return t('error.network.title')
			case guestError:
				return t('error.guest.title')
			case notLoggedInError:
				return t('error.notLoggedIn.title')
			case permissionError:
				return t('error.permission.title')
			default:
				return title
		}
	}

	const getMessage = (): string => {
		if (isConfirmedOutage) {
			return t('error.network.outageDescription')
		}
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
							name: isConfirmedOutage
								? 'CloudOff'
								: (icon?.web ?? 'TriangleAlert'),
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

				<ErrorActionButton
					title={title}
					buttonText={buttonText}
					onButtonPress={onButtonPress}
					inModal={inModal}
					isConfirmedOutage={isConfirmedOutage}
				/>
				{(refreshing != null &&
					title !== guestError &&
					title !== notLoggedInError) ||
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
