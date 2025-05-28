import type { MaterialIcon } from '@/types/material-icons'
import { guestError, networkError, permissionError } from '@/utils/api-utils'
import { trackEvent } from '@aptabase/react-native'
import { router, usePathname } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import {
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon, { type LucideIcon } from '../Universal/Icon'
import StatusBox from './ActionBox'

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
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')
	const path = usePathname()

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
	if (shouldTrack) {
		trackEvent('ErrorView', {
			title,
			path,
			crash: false
		})
	}

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
			default:
				if (message != null) {
					return message
				}
				return t('error.description')
		}
	}

	const ErrorButton = (): React.JSX.Element => {
		const buttonAction = (): void => {
			switch (title) {
				case guestError:
					router.navigate('/login')
					break
				default:
					if (onButtonPress != null) {
						onButtonPress()
					}
					break
			}
		}
		let buttonProps = null

		if (title === guestError) {
			buttonProps = {
				onPress: () => {
					router.navigate('/login')
				},
				text: t('error.guest.button')
			}
		} else if (onButtonPress != null && buttonText === undefined) {
			buttonProps = { onPress: buttonAction, text: t('error.button') }
		} else if (onButtonPress != null && buttonText !== undefined) {
			buttonProps = { onPress: buttonAction, text: buttonText }
		}

		return (buttonProps != null || title === guestError) &&
			title !== permissionError ? (
			<Pressable
				style={styles.logoutContainer(inModal)}
				onPress={buttonProps?.onPress}
			>
				<View style={styles.refreshButton}>
					<Text style={styles.refreshButtonText}>{buttonProps?.text}</Text>
				</View>
			</Pressable>
		) : (
			<></>
		)
	}

	return (
		<ScrollView
			refreshControl={
				refreshing != null && title !== guestError ? (
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				) : undefined
			}
			scrollEnabled={!inModal}
			contentContainerStyle={styles.container(inModal)}
		>
			<View style={styles.errorContainer}>
				<View style={styles.topContainer}>
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
					<Text style={styles.errorTitle} selectable>
						{getTitle().slice(0, 150)}
					</Text>
					<Text style={styles.errorInfo}>{getMessage()}</Text>
				</View>

				<ErrorButton />
				{(refreshing != null && title !== guestError) ||
				showPullLabel === true ? (
					<Text style={styles.errorFooter}>{t('error.pull')}</Text>
				) : null}
				{showBox && <StatusBox error={new Error(title)} crash={false} />}
			</View>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: (inModal: boolean) => ({
		paddingHorizontal: 25,
		flex: 1,
		paddingBottom: inModal ? 25 : Platform.OS === 'ios' ? 50 : 0, // iOS has transparent tab bar so we need to add padding
		backgroundColor: inModal ? theme.colors.card : undefined,
		borderRadius: inModal ? 10 : 0,
		paddingTop: inModal ? 25 : 0
	}),
	errorContainer: {
		flex: 1,
		gap: 12,
		justifyContent: 'space-evenly'
	},
	errorFooter: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		marginTop: 16,
		textAlign: 'center'
	},

	errorInfo: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '500',
		marginTop: 12,
		textAlign: 'center'
	},
	errorTitle: {
		color: theme.colors.text,
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
		marginTop: 8,
		textAlign: 'center'
	},
	logoutContainer: (inModal: boolean) => ({
		borderRadius: theme.radius.mg,
		marginBottom: 20,
		marginTop: 30,
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: inModal ? theme.colors.background : theme.colors.card
	}),
	refreshButton: {
		alignItems: 'center',
		flexDirection: 'row',
		paddingHorizontal: 40,
		paddingVertical: 10
	},
	refreshButtonText: {
		color: theme.colors.primary,
		fontSize: 16,
		fontWeight: '600'
	},
	topContainer: { alignItems: 'center', gap: 20 }
}))
