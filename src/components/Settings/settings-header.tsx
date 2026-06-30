import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Platform,
	Pressable,
	Text,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import { UserKindContext } from '@/components/contexts'
import PlatformIcon from '@/components/Universal/icon'
import type { UserKindContextType } from '@/contexts/userKind'
import { USER_EMPLOYEE, USER_GUEST } from '@/data/constants'
import type { PersDataDetails } from '@/types/thi-api'
import { loadSecureAsync } from '@/utils/storage'
import { getInitials } from '@/utils/ui-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import AvatarCircle from './avatar-circle'
import NameBox from './name-box'

interface SettingsHeaderProps {
	onLogout: () => void
	personalData?: PersDataDetails
	isLoading?: boolean
	isSuccess?: boolean
	error?: Error
}

export default function SettingsHeader({
	onLogout,
	personalData,
	isLoading,
	isSuccess,
	error
}: SettingsHeaderProps): React.JSX.Element {
	const { userKind = USER_GUEST } =
		React.use<UserKindContextType>(UserKindContext)
	const router = useRouter()
	const { t } = useTranslation(['settings', 'common'])
	const [username, setUsername] = React.useState<string>('')
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const primaryBackground = toColor(
		useCSSVariable('--color-primary-background')
	)
	const labelTertiaryColor = toColor(useCSSVariable('--color-label-tertiary'))

	React.useEffect(() => {
		const loadUsername = async (): Promise<void> => {
			if (userKind === USER_EMPLOYEE) {
				const loadedUsername = await loadSecureAsync('username')
				setUsername(loadedUsername ?? '')
			}
		}
		void loadUsername()
	}, [userKind])

	if (userKind === 'student') {
		return (
			<View
				className="self-center bg-card ios:rounded-ios android:rounded-md w-full mt-3"
				style={hairlineBorder}
			>
				<Pressable
					onPress={() => {
						router.navigate('/profile')
					}}
					className="ios:rounded-ios android:rounded-md overflow-hidden active:opacity-90"
				>
					<View className="items-center flex-row justify-between">
						{isSuccess && personalData?.mtknr !== undefined ? (
							<View className="flex-col flex-1">
								<View className="flex-row py-[15px] w-full">
									<NameBox
										title={`${personalData?.vname} ${personalData?.name}`}
										subTitle1={`${personalData?.stgru ?? ''}${t('semesterSuffix', { ns: 'common' })}`}
										subTitle2={personalData?.fachrich ?? ''}
										showChevron={true}
									>
										<AvatarCircle background={primaryBackground}>
											<Text
												className="text-[22px] font-bold"
												style={{ color: primaryColor }}
											>
												{getInitials(
													`${personalData?.vname} ${personalData?.name}`
												)}
											</Text>
										</AvatarCircle>
									</NameBox>
								</View>
							</View>
						) : isSuccess ? (
							<View className="flex-col flex-1">
								<View className="flex-row py-[15px] w-full">
									<NameBox
										title={t('menu.error.noData.title')}
										subTitle1={t('menu.error.noData.subtitle1')}
										subTitle2={t('menu.error.noData.subtitle2')}
										showChevron={true}
									>
										<AvatarCircle
											background={`${String(labelTertiaryColor)}25`}
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
													color: labelTertiaryColor,
													marginTop: Platform.OS === 'android' ? 2 : 0
												}}
											/>
										</AvatarCircle>
									</NameBox>
								</View>
							</View>
						) : isLoading ? (
							<View className="flex-col flex-1">
								<View className="items-center flex-row flex-1 justify-center my-[25px] py-[15px] w-full">
									<ActivityIndicator />
								</View>
							</View>
						) : (
							<View className="flex-col flex-1">
								<View className="flex-row py-[15px] w-full">
									<NameBox
										title={t('labels.error', { ns: 'common' })}
										subTitle1={
											error?.message ?? t('misc.unknownError', { ns: 'common' })
										}
										subTitle2={t('menu.error.subtitle2')}
									>
										<AvatarCircle
											background={`${String(labelTertiaryColor)}25`}
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
													color: labelTertiaryColor,
													marginTop: Platform.OS === 'android' ? 2 : 0
												}}
											/>
										</AvatarCircle>
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
			className="self-center bg-card ios:rounded-ios android:rounded-md w-full mt-3 active:opacity-90"
			style={hairlineBorder}
		>
			<View className="items-center flex-row justify-between">
				{userKind === 'employee' ? (
					<View className="flex-row py-[15px] w-full">
						<NameBox
							title={username as string}
							subTitle1={t('menu.employee.subtitle1')}
							subTitle2={t('menu.employee.subtitle2')}
						>
							<AvatarCircle background={primaryBackground}>
								<Text
									className="text-[22px] font-bold"
									style={{ color: primaryColor }}
								>
									{getInitials((username as string) ?? '')}
								</Text>
							</AvatarCircle>
						</NameBox>
					</View>
				) : (
					<View className="flex-row py-[15px] w-full">
						<NameBox
							title={t('menu.guest.title')}
							subTitle1={t('menu.guest.subtitle')}
							subTitle2={''}
							showChevron={true}
						>
							<AvatarCircle background={primaryBackground}>
								<PlatformIcon
									ios={{ name: 'person', variant: 'fill', size: 26 }}
									android={{ name: 'account_circle', size: 32 }}
									web={{ name: 'User', size: 32 }}
									style={{
										color: primaryColor,
										marginTop: Platform.OS === 'android' ? 2 : 0
									}}
								/>
							</AvatarCircle>
						</NameBox>
					</View>
				)}
			</View>
		</Pressable>
	)
}
