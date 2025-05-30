import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { NoSessionError } from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import PlatformIcon from '@/components/Universal/Icon'
import type { UserKindContextType } from '@/contexts/userKind'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import { getPersonalData } from '@/utils/api-utils'
import { loadSecureAsync } from '@/utils/storage'
import { getInitials } from '@/utils/ui-utils'
import Avatar from './Avatar'
import NameBox from './NameBox'

interface SettingsHeaderProps {
	onLogout: () => void
}

export default function SettingsHeader({
	onLogout
}: SettingsHeaderProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { userKind = USER_GUEST } =
		React.use<UserKindContextType>(UserKindContext)
	const router = useRouter()
	const { t } = useTranslation(['settings'])
	const [username, setUsername] = React.useState<string>('')

	// Load employee username when component mounts
	React.useEffect(() => {
		const loadUsername = async (): Promise<void> => {
			if (userKind === USER_EMPLOYEE) {
				const loadedUsername = await loadSecureAsync('username')
				setUsername(loadedUsername ?? '')
			}
		}
		void loadUsername()
	}, [userKind])

	const { data, error, isLoading, isSuccess } = useQuery({
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

	if (userKind === 'student') {
		return (
			<View style={styles.container}>
				<Pressable
					onPress={() => {
						router.navigate('/profile')
					}}
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
										<Avatar background={`${theme.colors.labelTertiaryColor}25`}>
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
										<Avatar background={`${theme.colors.labelTertiaryColor}25`}>
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
		)
	}

	return (
		<Pressable
			onPress={() => {
				if (userKind === 'employee') {
					onLogout()
				} else if (userKind === 'guest') {
					router.navigate('/login')
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
	)
}

const stylesheet = createStyleSheet((theme) => ({
	avatarText: {
		fontSize: 22,
		fontWeight: 'bold'
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
	iconGuest: {
		color: 'white',
		marginTop: Platform.OS === 'android' ? 2 : 0
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
		paddingVertical: 15,
		width: '100%'
	},
	nameOuterContainer: { flexDirection: 'column', flex: 1 }
}))
