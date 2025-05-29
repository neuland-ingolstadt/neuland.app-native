import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { use, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	Dimensions,
	LayoutAnimation,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { queryClient } from '@/components/provider'
import type { UserKindContextType } from '@/contexts/userKind'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { getPersonalData, performLogout } from '@/utils/api-utils'
import { calculateECTS } from '@/utils/grades-utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import GuestInfoSection from './GuestInfoSection'
import SettingsHeader from './SettingsHeader'
import SettingsLogo from './SettingsLogo'
import SettingsMenu from './SettingsMenu'
import StudentInfoSection from './StudentInfoSection'

export default function Settings(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { userKind = USER_GUEST } = use<UserKindContextType>(UserKindContext)
	const { resetOrder } = use(DashboardContext)
	const insets = useSafeAreaInsets()
	const windowView = Dimensions.get('window')
	const width = windowView.width - insets.left - insets.right
	const height = windowView.height - insets.top - insets.bottom
	const router = useRouter()
	const { t } = useTranslation(['settings'])
	const scrollY = useRef(0)
	const resetPreferences = usePreferencesStore((state) => state.reset)
	const resetFood = useFoodFilterStore((state) => state.reset)

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
						resetFood()
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
				scrollY.current = event.nativeEvent.contentOffset.y
			}}
			scrollEventThrottle={16}
			contentInsetAdjustmentBehavior="automatic"
			contentContainerStyle={styles.contentContainer}
		>
			<View style={styles.wrapper}>
				<SettingsHeader onLogout={logoutAlert} />

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

			<SettingsLogo scrollY={scrollY.current} width={width} height={height} />
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
	wrapper: { paddingHorizontal: 12 }
}))
