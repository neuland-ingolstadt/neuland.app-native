import { createGuestSession, createSession } from '@/api/thi-session-handler'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import {
	STATUS_URL,
	USER_EMPLOYEE,
	USER_GUEST,
	USER_STUDENT
} from '@/data/constants'
import { trimErrorMsg } from '@/utils/api-utils'
import { loadSecureAsync } from '@/utils/storage'
import { getContrastColor } from '@/utils/ui-utils'
import { toast } from 'burnt'
import Color from 'color'
import * as Haptics from 'expo-haptics'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Alert,
	Linking,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import {
	UnistylesRuntime,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles'
import PlatformIcon from './Icon'

const LoginForm = ({
	navigateHome
}: {
	navigateHome: () => void
}): React.JSX.Element => {
	const ORIGINAL_ERROR_WRONG_CREDENTIALS = 'Wrong credentials'
	const ORGINAL_ERROR_MISSING = 'Wrong or missing parameter'
	const KNOWN_BACKEND_ERRORS = ['Response is not valid JSON']
	const ORIGINAL_ERROR_NO_CONNECTION = 'Network request failed'
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const { styles, theme } = useStyles(stylesheet)
	const { userKind, toggleUserKind } = React.useContext(UserKindContext)
	const [loading, setLoading] = useState(false)
	const { t } = useTranslation('flow')
	const { resetOrder } = useContext(DashboardContext)
	const [showPassword, setShowPassword] = useState(false)

	async function login(): Promise<void> {
		let showStatus = true
		try {
			setLoading(true)
			const userKind = await createSession(username, password, true)
			toggleUserKind(userKind)
			resetOrder(userKind ? USER_STUDENT : USER_EMPLOYEE)
			if (Platform.OS === 'ios') {
				void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
			}
			toast({
				title: t('login.toast'),
				preset: 'done',
				haptic: 'success',
				duration: 2.5,
				from: 'top'
			})
			navigateHome()
		} catch (e) {
			console.error('Failed to login', e)

			const error = e as Error
			const message = trimErrorMsg(error.message)
			setLoading(false)

			let title = t('login.alert.error.title')
			let msg = t('login.alert.error.generic')

			if (message.includes(ORIGINAL_ERROR_WRONG_CREDENTIALS)) {
				title = t('login.alert.error.wrongCredentials.title')
				msg = t('login.alert.error.wrongCredentials.message')
				showStatus = false
				setPassword('')
			} else if (message.includes(ORIGINAL_ERROR_NO_CONNECTION)) {
				title = t('login.alert.error.noConnection.title')
				msg = t('login.alert.error.noConnection.message')
				showStatus = false
			} else if (message.includes(ORGINAL_ERROR_MISSING)) {
				msg = t('login.alert.error.missing')
				showStatus = false
			} else if (
				KNOWN_BACKEND_ERRORS.some((error) => message.includes(error))
			) {
				msg = t('login.alert.error.backend')
			}
			if (Platform.OS === 'web') {
				toast({
					title: msg,
					preset: 'error',
					duration: 2.5
				})
			} else {
				Alert.alert(
					title,
					msg,
					[
						{ text: 'OK' },
						...(showStatus
							? [
									{
										text: t('error.crash.status', {
											ns: 'common'
										}),
										onPress: async () =>
											(await Linking.openURL(STATUS_URL)) as Promise<void>
									}
								]
							: [])
					],
					{
						cancelable: false
					}
				)
			}
		}
	}

	async function guestLogin(): Promise<void> {
		setLoading(true)
		setUsername('')
		setPassword('')

		try {
			await createGuestSession(userKind !== USER_GUEST)
		} catch (error) {
			console.error('Failed to create guest session', error)
		}

		toggleUserKind(undefined)
		navigateHome()
		setLoading(false)
	}

	useEffect(() => {
		// on iOS secure store is synced with iCloud, so we can prefill the login form
		if (Platform.OS === 'ios') {
			const loadSavedData = async (): Promise<void> => {
				try {
					const savedUsername = await loadSecureAsync('username')
					const savedPassword = await loadSecureAsync('password')
					if (savedUsername !== null && savedPassword !== null) {
						setUsername(savedUsername)
						setPassword(savedPassword)

						Alert.alert(
							t('login.alert.restored.title'),
							t('login.alert.restored.message'),
							[{ text: 'OK' }],
							{
								cancelable: false
							}
						)
					}
				} catch (error) {
					console.error('Error loading saved credentials:', error)
				}
			}

			void loadSavedData()
		}
	}, [])

	const signInDisabled =
		username.trim() === '' || password.trim() === '' || loading

	return (
		<View style={styles.container}>
			<View style={styles.loginContainer}>
				<Text style={styles.welcomeText}>{t('login.getStarted')}</Text>
				<Text style={styles.subtitleText}>{t('login.title2')}</Text>

				<View style={styles.inputContainer}>
					<View style={styles.inputWrapper}>
						<PlatformIcon
							ios={{
								name: 'person',
								size: 20
							}}
							android={{
								name: 'person',
								size: 24
							}}
							web={{
								name: 'User',
								size: 20
							}}
							style={{ color: theme.colors.labelColor }}
						/>
						<TextInput
							style={styles.textInput}
							selectionColor={theme.colors.primary}
							placeholderTextColor={theme.colors.labelColor}
							defaultValue={username}
							placeholder="abc1234"
							returnKeyType="next"
							onChangeText={(text) => {
								setUsername(text)
							}}
							autoCapitalize="none"
							clearButtonMode="while-editing"
							autoComplete="email"
							textContentType="emailAddress"
							autoCorrect={false}
						/>
					</View>

					<View style={styles.inputWrapper}>
						<PlatformIcon
							ios={{
								name: 'lock',
								size: 20
							}}
							android={{
								name: 'lock',
								size: 24
							}}
							web={{
								name: 'Lock',
								size: 20
							}}
							style={{ color: theme.colors.labelColor }}
						/>
						<TextInput
							style={styles.textInput}
							selectionColor={theme.colors.primary}
							placeholderTextColor={theme.colors.labelColor}
							placeholder={t('login.password')}
							defaultValue={password}
							returnKeyType="done"
							onChangeText={(text) => {
								setPassword(text)
							}}
							onSubmitEditing={() => {
								if (username !== '') {
									login().catch((error: unknown) => {
										console.debug(error)
									})
								}
							}}
							selectTextOnFocus={true}
							secureTextEntry={!showPassword}
							autoCapitalize="none"
							clearButtonMode="while-editing"
							autoComplete="current-password"
							textContentType="password"
							autoCorrect={false}
						/>
						<TouchableOpacity
							style={styles.eyeIcon}
							onPress={() => setShowPassword(!showPassword)}
						>
							<PlatformIcon
								ios={{
									name: showPassword ? 'eye.slash' : 'eye',
									size: 16
								}}
								android={{
									name: showPassword ? 'visibility_off' : 'visibility',
									size: 20
								}}
								web={{
									name: showPassword ? 'EyeOff' : 'Eye',
									size: 18
								}}
								style={{ color: theme.colors.labelColor }}
							/>
						</TouchableOpacity>
					</View>
				</View>

				<TouchableOpacity
					disabled={signInDisabled}
					onPress={() => {
						login().catch((error: unknown) => {
							console.debug(error)
						})
					}}
					style={styles.loginButton(signInDisabled)}
				>
					{loading ? (
						<ActivityIndicator
							color={getContrastColor(theme.colors.primary)}
							size={15}
						/>
					) : (
						<Text style={styles.buttonText(signInDisabled)}>
							{t('login.button')}
						</Text>
					)}
				</TouchableOpacity>

				<View style={styles.dividerContainer}>
					<View style={styles.divider} />
					<Text style={styles.dividerText}>{t('login.or')}</Text>
					<View style={styles.divider} />
				</View>

				<TouchableOpacity
					style={styles.guestButton}
					onPress={() => {
						guestLogin().catch((error: unknown) => {
							console.debug(error)
						})
					}}
				>
					<Text style={styles.guestText}>{t('login.guest')}</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%'
	},
	loginContainer: {
		backgroundColor: theme.colors.card,
		borderRadius: 24,
		justifyContent: 'center',
		maxWidth: 400,
		paddingBottom: 30,
		paddingHorizontal: 25,
		paddingTop: 30,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border,
		width: '100%',
		elevation: 5
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 20
	},
	logo: {
		width: 80,
		height: 80
	},
	welcomeText: {
		color: theme.colors.text,
		fontSize: 28,
		fontWeight: '700',
		textAlign: 'center',
		marginBottom: 8
	},
	subtitleText: {
		color: theme.colors.labelColor,
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 30
	},
	inputContainer: {
		gap: 16
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: theme.colors.inputBackground,
		borderRadius: 8,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border,
		paddingHorizontal: 12
	},
	textInput: {
		flex: 1,
		color: theme.colors.text,
		fontSize: 16,
		paddingVertical: 12,
		marginLeft: 8
	},
	eyeIcon: {
		padding: 4
	},
	loginButton: (disabled: boolean) => ({
		height: 48,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 24,
		borderRadius: 8,
		backgroundColor: disabled
			? UnistylesRuntime.themeName === 'dark'
				? Color(theme.colors.primary).darken(0.3).hex()
				: Color(theme.colors.primary).lighten(0.3).hex()
			: theme.colors.primary
	}),
	buttonText: (disabled: boolean) => ({
		fontWeight: '600',
		fontSize: 16,
		color: disabled
			? UnistylesRuntime.themeName === 'dark'
				? Color(getContrastColor(theme.colors.primary)).lighten(0.1).hex()
				: Color(getContrastColor(theme.colors.primary)).darken(0.1).hex()
			: getContrastColor(theme.colors.primary)
	}),
	dividerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 26
	},
	divider: {
		flex: 1,
		height: StyleSheet.hairlineWidth,
		backgroundColor: theme.colors.border
	},
	dividerText: {
		color: theme.colors.labelColor,
		marginHorizontal: 10,
		fontSize: 13
	},
	guestButton: {
		alignItems: 'center',
		paddingTop: 6,
		marginTop: 14
	},
	guestText: {
		color: theme.colors.labelColor,
		fontSize: 14,
		fontWeight: '400'
	}
}))

export default LoginForm
