import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { use, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	LayoutAnimation,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import LogoSVG from '@/components/Flow/svgs/logo'
import { queryClient } from '@/components/provider'
import PlatformIcon from '@/components/Universal/Icon'
import type { UserKindContextType } from '@/contexts/userKind'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { useMemberStore } from '@/hooks/useMemberStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { getPersonalData, performLogout } from '@/utils/api-utils'
import { calculateECTS } from '@/utils/grades-utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import Avatar from './Avatar'
import GuestInfoSection from './GuestInfoSection'
import SettingsHeader from './SettingsHeader'
import SettingsLogo from './SettingsLogo'
import SettingsMenu from './SettingsMenu'
import StudentInfoSection from './StudentInfoSection'

const NeulandBox = () => {
	const { styles, theme } = useStyles(stylesheet)
	const router = useRouter()
	const memberInfo = useMemberStore((s) => s.info)

	if (!memberInfo) {
		return null
	}

	return (
		<View style={styles.neulandContainer}>
			<Pressable
				onPress={() => router.push('/(screens)/member')}
				style={styles.neulandBox}
			>
				<View style={styles.neulandBoxContent}>
					<Avatar
						background={`${theme.colors.neulandGreen}25`}
						size={50}
						style={styles.neulandAvatar}
					>
						<LogoSVG size={35} color={theme.colors.text} />
					</Avatar>

					<View>
						<Text style={styles.neulandTitle}>Neuland Member</Text>
						<Text style={styles.neulandName}>{memberInfo.name}</Text>
					</View>
				</View>
				<PlatformIcon
					ios={{ name: 'chevron.right', size: 18 }}
					android={{ name: 'chevron_right', size: 24 }}
					web={{ name: 'ChevronRight', size: 24 }}
					style={styles.neulandChevron}
				/>
			</Pressable>
		</View>
	)
}

export default function Settings(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { userKind = USER_GUEST } = use<UserKindContextType>(UserKindContext)
	const { resetOrder } = use(DashboardContext)
	const router = useRouter()
	const { t } = useTranslation(['settings'])
	const [scrollY, setScrollY] = useState(0)
	const [size, setSize] = useState({ width: 0, height: 0 })
	const resetPreferences = usePreferencesStore((state) => state.reset)
	const { idToken } = useMemberStore()

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

	const { data, isLoading, isSuccess, refetch, isError } = useQuery({
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

	const { toggleUserKind } = React.use(UserKindContext)

	React.useEffect(() => {
		if (isLoading || isSuccess) {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		}
	}, [isLoading, isSuccess])

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
				setScrollY(event.nativeEvent.contentOffset.y)
			}}
			onLayout={(event) => {
				setSize(event.nativeEvent.layout)
			}}
			showsVerticalScrollIndicator={false}
			scrollEventThrottle={16}
			contentInsetAdjustmentBehavior="automatic"
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.wrapper}>
				<SettingsHeader onLogout={logoutAlert} />
				{idToken && <NeulandBox />}
				<View style={styles.infoBoxesSection}>
					{userKind === USER_GUEST ? (
						<GuestInfoSection />
					) : userKind === USER_STUDENT ? (
						<StudentInfoSection
							ects={ects}
							printerBalance={data?.pcounter?.toString() ?? '0'}
							personalLecturersCount={personalLecturers}
						/>
					) : undefined}
				</View>

				<View style={styles.formlistContainer}>
					<SettingsMenu />
				</View>
			</View>

			<Text style={styles.copyright}>
				{t('menu.copyright', { year: new Date().getFullYear() })}
			</Text>

			<SettingsLogo scrollY={scrollY} size={size} />
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
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
	infoBoxesSection: {
		marginTop: 10
	},
	wrapper: { paddingHorizontal: 12 },
	neulandContainer: {
		marginTop: 10,
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		shadowColor: '#00ff3c',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
		elevation: 15
	},
	neulandBox: {
		flex: 1,
		padding: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border
	},
	neulandBoxContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16
	},
	neulandTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600'
	},
	neulandName: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14,
		marginTop: 4
	},
	neulandChevron: {
		color: theme.colors.labelSecondaryColor
	},
	neulandAvatar: {
		paddingRight: 3
	}
}))
