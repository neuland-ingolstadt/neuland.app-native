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

interface ErrorIconProp {
	ios: string
	android: MaterialIcon
	web: LucideIcon
	multiColor?: boolean
}

interface ErrorViewProps {
	title: string
	message?: string
	icon?: ErrorIconProp
	buttonText?: string
	onButtonPress?: () => void
	onRefresh?: () => unknown
	refreshing?: boolean
	showPullLabel?: boolean
	inModal?: boolean
	isCritical?: boolean
	/** Only upgrade networkError when one of these Gatus services is down. */
	statusServices?: ServiceStatus | readonly ServiceStatus[]
}

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

function isAuthError(title: string): boolean {
	return title === guestError || title === notLoggedInError
}

function isTrackedError(title: string, isCritical: boolean): boolean {
	const isKnown =
		title === networkError ||
		title === guestError ||
		title === notLoggedInError ||
		title === permissionError
	return !isKnown && isCritical
}

function getErrorIcons(
	title: string,
	isConfirmedOutage: boolean,
	icon?: ErrorIconProp
): { ios: string; android: MaterialIcon; web: LucideIcon } {
	if (isConfirmedOutage) {
		return {
			ios: 'personalhotspot.slash',
			android: 'cloud_off',
			web: 'CloudOff'
		}
	}

	switch (title) {
		case networkError:
			return {
				ios: 'wifi.slash',
				android: 'wifi_off',
				web: icon?.web ?? 'TriangleAlert'
			}
		case guestError:
		case notLoggedInError:
			return {
				ios: 'person.crop.circle.badge.questionmark',
				android: 'person_cancel',
				web: icon?.web ?? 'TriangleAlert'
			}
		case permissionError:
			return {
				ios: 'person.crop.circle.badge.exclamationmark',
				android: 'person_alert',
				web: icon?.web ?? 'TriangleAlert'
			}
		default:
			return {
				ios: icon?.ios ?? 'exclamationmark.triangle.fill',
				android: icon?.android ?? 'error',
				web: icon?.web ?? 'TriangleAlert'
			}
	}
}

interface ErrorDetailsProps {
	title: string
	message?: string
	icon?: ErrorIconProp
	isConfirmedOutage: boolean
}

function ErrorDetails({
	title,
	message,
	icon,
	isConfirmedOutage
}: ErrorDetailsProps): React.JSX.Element {
	const { t } = useTranslation('common')
	const icons = getErrorIcons(title, isConfirmedOutage, icon)

	let heading = title
	let body = message ?? t('error.description')

	if (isConfirmedOutage) {
		heading = t('error.network.outageTitle')
		body = t('error.network.outageDescription')
	} else if (title === networkError) {
		heading = t('error.network.title')
		body = t('error.network.description')
	} else if (title === guestError) {
		heading = t('error.guest.title')
		body = t('error.guest.description')
	} else if (title === notLoggedInError) {
		heading = t('error.notLoggedIn.title')
		body = t('error.notLoggedIn.description')
	} else if (title === permissionError) {
		heading = t('error.permission.title')
		body = t('error.permission.description')
	}

	return (
		<View className="items-center gap-5">
			<PlatformIcon
				ios={{
					name: icons.ios,
					size: 50,
					...((icon?.multiColor ?? false)
						? { renderMode: 'multicolor', variableValue: 1 }
						: {})
				}}
				android={{
					name: icons.android,
					size: 64
				}}
				web={{
					name: icons.web,
					size: 64
				}}
			/>
			<Text className="my-2 text-center text-xl font-bold text-text" selectable>
				{heading.slice(0, 150)}
			</Text>
			<Text className="mt-3 text-center text-base font-medium text-text">
				{body}
			</Text>
		</View>
	)
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
	} else if (isAuthError(title)) {
		buttonProps = {
			onPress: () => {
				router.navigate('/login')
			},
			text: t('error.guest.button')
		}
	} else if (onButtonPress != null) {
		buttonProps = {
			onPress: () => {
				handleErrorButtonPress(title, onButtonPress)
			},
			text: buttonText ?? t('error.button')
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
}: ErrorViewProps): React.JSX.Element {
	const { t } = useTranslation('common')
	const path = usePathname()
	const analyticsInitialized = useSessionStore(
		(state) => state.analyticsInitialized
	)
	const { isServiceDown } = useServiceStatus()
	const isConfirmedOutage =
		title === networkError &&
		matchesServiceOutage(isServiceDown, statusServices)
	const shouldTrack = isTrackedError(title, isCritical)
	const showBox = !inModal && shouldTrack
	const showRefresh = refreshing != null && !isAuthError(title)
	const showPullHint = showRefresh || showPullLabel === true

	useEffect(() => {
		if (!analyticsInitialized || !shouldTrack) return
		trackEvent('ErrorView', {
			title,
			path,
			crash: false
		})
	}, [analyticsInitialized, shouldTrack, title, path])

	const scrollContentClassName = inModal
		? 'flex-1 px-[25px] pb-[25px] bg-card rounded-ios pt-[25px]'
		: `flex-1 px-[25px] ${Platform.OS === 'ios' ? 'pb-[50px]' : ''}`

	return (
		<ScrollView
			refreshControl={
				showRefresh ? (
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
				<ErrorDetails
					title={title}
					message={message}
					icon={icon}
					isConfirmedOutage={isConfirmedOutage}
				/>
				<ErrorActionButton
					title={title}
					buttonText={buttonText}
					onButtonPress={onButtonPress}
					inModal={inModal}
					isConfirmedOutage={isConfirmedOutage}
				/>
				{showPullHint ? (
					<Text className="mt-4 text-center text-base font-semibold text-text">
						{t('error.pull')}
					</Text>
				) : null}
				{showBox && <StatusBox error={new Error(title)} crash={false} />}
			</Animated.View>
		</ScrollView>
	)
}
