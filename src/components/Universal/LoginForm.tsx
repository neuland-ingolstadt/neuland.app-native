import { createGuestSession, createSession } from '@/api/thi-session-handler';
import { DashboardContext, UserKindContext } from '@/components/contexts';
import {
	STATUS_URL,
	USER_EMPLOYEE,
	USER_GUEST,
	USER_STUDENT
} from '@/data/constants';
import { trimErrorMsg } from '@/utils/api-utils';
import { loadSecure } from '@/utils/storage';
import { getContrastColor } from '@/utils/ui-utils';
import { toast } from 'burnt';
import Color from 'color';
import * as Haptics from 'expo-haptics';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	Alert,
	Linking,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import {
	UnistylesRuntime,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles';

const LoginForm = ({
	navigateHome
}: {
	navigateHome: () => void;
}): React.JSX.Element => {
	const ORIGINAL_ERROR_WRONG_CREDENTIALS = 'Wrong credentials';
	const ORGINAL_ERROR_MISSING = 'Wrong or missing parameter';
	const KNOWN_BACKEND_ERRORS = ['Response is not valid JSON'];
	const ORIGINAL_ERROR_NO_CONNECTION = 'Network request failed';
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const { styles, theme } = useStyles(stylesheet);
	// No guest fallback is provided, so the guest session will be created correctly
	const { userKind, toggleUserKind } = React.useContext(UserKindContext);
	const [loading, setLoading] = useState(false);
	const { t } = useTranslation('flow');
	const { resetOrder } = useContext(DashboardContext);

	async function login(): Promise<void> {
		let showStatus = true;
		try {
			setLoading(true);
			const userKind = await createSession(username, password, true);
			toggleUserKind(userKind);
			resetOrder(userKind ? USER_STUDENT : USER_EMPLOYEE);
			if (Platform.OS === 'ios') {
				void Haptics.notificationAsync(
					Haptics.NotificationFeedbackType.Success
				);
			}
			toast({
				title: t('login.toast'),
				preset: 'done',
				haptic: 'success',
				duration: 2.5,
				from: 'top'
			});
			navigateHome();
		} catch (e) {
			console.error('Failed to login', e);

			const error = e as Error;
			const message = trimErrorMsg(error.message);
			setLoading(false);

			let title = t('login.alert.error.title');
			let msg = t('login.alert.error.generic');

			if (message.includes(ORIGINAL_ERROR_WRONG_CREDENTIALS)) {
				title = t('login.alert.error.wrongCredentials.title');
				msg = t('login.alert.error.wrongCredentials.message');
				showStatus = false;
				setPassword('');
			} else if (message.includes(ORIGINAL_ERROR_NO_CONNECTION)) {
				title = t('login.alert.error.noConnection.title');
				msg = t('login.alert.error.noConnection.message');
				showStatus = false;
			} else if (message.includes(ORGINAL_ERROR_MISSING)) {
				msg = t('login.alert.error.missing');
				showStatus = false;
			} else if (
				KNOWN_BACKEND_ERRORS.some((error) => message.includes(error))
			) {
				msg = t('login.alert.error.backend');
			}
			if (Platform.OS === 'web') {
				toast({
					title: msg,
					preset: 'error',
					duration: 2.5
				});
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
				);
			}
		}
	}

	async function guestLogin(): Promise<void> {
		setLoading(true);
		setUsername('');
		setPassword('');

		try {
			await createGuestSession(userKind !== USER_GUEST);
		} catch (error) {
			console.error('Failed to create guest session', error);
		}

		toggleUserKind(undefined);
		navigateHome();
		setLoading(false);
	}

	useEffect(() => {
		// on iOS secure store is synced with iCloud, so we can prefill the login form
		if (Platform.OS === 'ios') {
			const loadSavedData = (): void => {
				const savedUsername = loadSecure('username');
				const savedPassword = loadSecure('password');
				if (savedUsername !== null && savedPassword !== null) {
					setUsername(savedUsername);
					setPassword(savedPassword);

					Alert.alert(
						t('login.alert.restored.title'),
						t('login.alert.restored.message'),
						[{ text: 'OK' }],
						{
							cancelable: false
						}
					);
				}
			};

			loadSavedData();
		}
	}, []);

	const signInDisabled =
		username.trim() === '' || password.trim() === '' || loading;

	return (
		<View style={styles.container}>
			<View style={styles.loginContainer}>
				<Text
					style={styles.header}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={1}
				>
					{'THI Account'}
				</Text>
				<View style={styles.userNameContainer}>
					<Text style={styles.userNameLabel}>{t('login.username')}</Text>
					<TextInput
						style={styles.textInput}
						placeholderTextColor={theme.colors.labelColor}
						defaultValue={username}
						returnKeyType="next"
						placeholder="abc1234"
						onChangeText={(text) => {
							setUsername(text);
						}}
						clearButtonMode="while-editing"
						selectionColor={theme.colors.primary}
						autoCapitalize="none"
						autoCorrect={false}
						textContentType="username"
					/>
				</View>
				<View style={styles.passwordContainer}>
					<Text style={styles.userNameLabel}>{t('login.password')}</Text>

					<TextInput
						style={styles.textInput}
						placeholderTextColor={theme.colors.labelColor}
						placeholder={t('login.password')}
						defaultValue={password}
						returnKeyType="done"
						onChangeText={(text) => {
							setPassword(text);
						}}
						onSubmitEditing={() => {
							if (username !== '') {
								login().catch((error: unknown) => {
									console.debug(error);
								});
							}
						}}
						selectionColor={theme.colors.primary}
						selectTextOnFocus={true}
						autoCapitalize="none"
						secureTextEntry={true}
						clearButtonMode="while-editing"
						autoComplete="current-password"
						textContentType="password"
						autoCorrect={false}
					/>
				</View>
				<TouchableOpacity
					disabled={signInDisabled}
					onPress={() => {
						login().catch((error: unknown) => {
							console.debug(error);
						});
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
				<View style={styles.guestContainer}>
					<TouchableOpacity
						onPress={() => {
							guestLogin().catch((error: unknown) => {
								console.debug(error);
							});
						}}
					>
						<Text style={styles.guestText}>{t('login.guest')}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const black = '#000000';
const stylesheet = createStyleSheet((theme) => ({
	buttonText: (disabled: boolean) => ({
		fontWeight: 'bold',
		fontSize: 15,
		color: disabled
			? UnistylesRuntime.themeName === 'dark'
				? Color(getContrastColor(theme.colors.primary)).lighten(0.1).hex()
				: Color(getContrastColor(theme.colors.primary)).darken(0.1).hex()
			: getContrastColor(theme.colors.primary)
	}),
	container: { alignItems: 'center', justifyContent: 'center' },
	guestContainer: {
		alignItems: 'center',
		paddingTop: 24
	},
	guestText: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14.5
	},
	header: {
		color: theme.colors.text,
		fontSize: 23,
		fontWeight: '600',
		marginBottom: 14,
		textAlign: 'left'
	},
	loginButton: (disabled: boolean) => ({
		height: 40,
		justifyContent: 'center',
		paddingHorizontal: 20,
		marginTop: 25,
		borderRadius: 7,
		alignItems: 'center',
		backgroundColor: disabled
			? UnistylesRuntime.themeName === 'dark'
				? Color(theme.colors.primary).darken(0.3).hex()
				: Color(theme.colors.primary).lighten(0.3).hex()
			: theme.colors.primary
	}),

	loginContainer: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.mg,
		justifyContent: 'center',
		maxWidth: 400,
		paddingBottom: 30,
		paddingHorizontal: 25,
		paddingTop: 30,
		shadowColor: black,
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		width: '100%'
	},
	passwordContainer: {
		paddingTop: 15
	},

	textInput: {
		backgroundColor: theme.colors.inputBackground,
		borderColor: theme.colors.border,
		borderRadius: 7,
		borderWidth: 1,
		color: theme.colors.text,
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 10
	},
	userNameContainer: {
		paddingTop: 3
	},
	userNameLabel: {
		color: theme.colors.text,
		fontSize: 15,
		paddingBottom: 5
	}
}));

export default LoginForm;
