import { toast } from 'burnt'
import * as Haptics from 'expo-haptics'
import React, { use, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	Animated,
	Linking,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import { createGuestSession, createSession } from '@/api/thi-session-handler'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { queryClient } from '@/components/provider'
import {
	STATUS_URL,
	USER_EMPLOYEE,
	USER_GUEST,
	USER_STUDENT
} from '@/data/constants'
import { trimErrorMsg } from '@/utils/api-utils'
import { loadSecureAsync } from '@/utils/storage'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import Button from './button'
import PlatformIcon from './icon'

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
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const borderColor = String(
		toColor(useCSSVariable('--color-border')) ?? '#d8d8d8'
	)
	const { userKind, toggleUserKind } = React.use(UserKindContext)
	const [loading, setLoading] = useState(false)
	const { t } = useTranslation('flow')
	const { resetOrder } = use(DashboardContext)
	const [showPassword, setShowPassword] = useState(false)
	const shakeAnimation = useState(new Animated.Value(0))[0]

	const shake = () => {
		Animated.sequence([
			Animated.timing(shakeAnimation, {
				toValue: 5,
				duration: 50,
				useNativeDriver: true
			}),
			Animated.timing(shakeAnimation, {
				toValue: -5,
				duration: 50,
				useNativeDriver: true
			}),
			Animated.timing(shakeAnimation, {
				toValue: 5,
				duration: 50,
				useNativeDriver: true
			}),
			Animated.timing(shakeAnimation, {
				toValue: 0,
				duration: 50,
				useNativeDriver: true
			})
		]).start()
	}

	async function login(): Promise<void> {
		let showStatus = true
		try {
			setLoading(true)
			const userKind = await createSession(username, password)
			toggleUserKind(userKind)
			resetOrder(userKind ? USER_STUDENT : USER_EMPLOYEE)
			await queryClient.invalidateQueries()
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
			shake()

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
				toast({ title: msg, preset: 'error', duration: 2.5 })
			} else {
				Alert.alert(
					title,
					msg,
					[
						{ text: t('misc.ok', { ns: 'common' }) },
						...(showStatus
							? [
									{
										text: t('error.crash.status', { ns: 'common' }),
										onPress: async () =>
											(await Linking.openURL(STATUS_URL)) as Promise<void>
									}
								]
							: [])
					],
					{ cancelable: false }
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

		if (Platform.OS === 'web') {
			setTimeout(() => {
				navigateHome()
				setLoading(false)
			}, 0)
		} else {
			navigateHome()
			setLoading(false)
		}
	}

	useEffect(() => {
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
							[{ text: t('misc.ok', { ns: 'common' }) }],
							{ cancelable: false }
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
		<View className="items-center justify-center w-full">
			<View
				className="items-center justify-center max-w-[400px] pb-[30px] px-[25px] pt-[30px] w-full bg-card rounded-3xl border-border"
				style={[hairlineBorder, { elevation: 5 }]}
			>
				<Text className="text-text text-[28px] font-bold text-center mb-2">
					{t('login.getStarted')}
				</Text>
				<Text className="text-label text-base text-center mb-[30px]">
					{t('login.title2')}
				</Text>

				<View className="gap-4">
					<View
						className="flex-row items-center bg-input-background rounded-sm border-border px-3"
						style={hairlineBorder}
					>
						<PlatformIcon
							ios={{ name: 'person', size: 20 }}
							android={{ name: 'person', size: 24 }}
							web={{ name: 'User', size: 20 }}
							style={{ color: labelColor }}
						/>
						<TextInput
							className="flex-1 text-text text-base py-3 ml-2"
							selectionColor={primaryColor}
							placeholderTextColor={labelColor}
							defaultValue={username}
							placeholder={t('login.usernamePlaceholder')}
							returnKeyType="next"
							onChangeText={setUsername}
							autoCapitalize="none"
							clearButtonMode="while-editing"
							autoComplete="email"
							textContentType="emailAddress"
							autoCorrect={false}
						/>
					</View>

					<Animated.View
						className="flex-row items-center bg-input-background rounded-sm border-border px-3"
						style={[
							hairlineBorder,
							{ transform: [{ translateX: shakeAnimation }] }
						]}
					>
						<PlatformIcon
							ios={{ name: 'lock', size: 20 }}
							android={{ name: 'lock', size: 24 }}
							web={{ name: 'Lock', size: 20 }}
							style={{ color: labelColor }}
						/>
						<TextInput
							className="flex-1 text-text text-base py-3 ml-2"
							selectionColor={primaryColor}
							placeholderTextColor={labelColor}
							placeholder={t('login.password')}
							defaultValue={password}
							returnKeyType="done"
							onChangeText={setPassword}
							onSubmitEditing={() => {
								if (username !== '') {
									login().catch((error: unknown) => console.debug(error))
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
							className="p-1"
							onPress={() => setShowPassword(!showPassword)}
						>
							<PlatformIcon
								ios={{ name: showPassword ? 'eye.slash' : 'eye', size: 16 }}
								android={{
									name: showPassword ? 'visibility_off' : 'visibility',
									size: 20
								}}
								web={{ name: showPassword ? 'EyeOff' : 'Eye', size: 18 }}
								style={{ color: labelColor }}
							/>
						</TouchableOpacity>
					</Animated.View>
				</View>

				<Button
					disabled={signInDisabled}
					loading={loading}
					onPress={() =>
						login().catch((error: unknown) => console.debug(error))
					}
					style={{ marginTop: 24 }}
				>
					{t('login.button')}
				</Button>

				<View className="flex-row items-center mt-[26px]">
					<View
						className="flex-1"
						style={{
							height: hairlineBorder.borderWidth,
							backgroundColor: borderColor
						}}
					/>
					<Text className="text-label mx-2.5 text-[13px]">{t('login.or')}</Text>
					<View
						className="flex-1"
						style={{
							height: hairlineBorder.borderWidth,
							backgroundColor: borderColor
						}}
					/>
				</View>

				<TouchableOpacity
					className="items-center pt-1.5 mt-3.5"
					onPress={() =>
						guestLogin().catch((error: unknown) => console.debug(error))
					}
				>
					<Text className="text-label text-sm font-normal">
						{t('login.guest')}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default LoginForm
