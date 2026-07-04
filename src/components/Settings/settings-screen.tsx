import { trackEvent } from '@aptabase/react-native'
import { useQuery } from '@tanstack/react-query'
import { Link, useRouter } from 'expo-router'
import React, { use, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	LayoutAnimation,
	Platform,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { queryClient } from '@/components/provider'
import type { UserKindContextType } from '@/contexts/userKind'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { useMemberStore } from '@/hooks/useMemberStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { getPersonalData, performLogout } from '@/utils/api-utils'
import { calculateECTS } from '@/utils/grades-utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import { toColor } from '@/utils/uniwind-utils'
import EmployeeInfoSection from './employee-info-section'
import GuestInfoSection from './guest-info-section'
import HetznerLogo from './hetzner-logo'
import NeulandBox from './neuland-box'
import SettingsHeader from './settings-header'
import SettingsLogo from './settings-logo'
import SettingsMenu from './settings-menu'
import StudentInfoSection from './student-info-section'

function trackHetznerClick(): void {
	trackEvent('Sponsor', {
		sponsor: 'Hetzner'
	})
}

export default function Settings(): React.JSX.Element {
	const { userKind = USER_GUEST } = use<UserKindContextType>(UserKindContext)
	const { resetOrder } = use(DashboardContext)
	const router = useRouter()
	const { t } = useTranslation(['settings'])
	const [scrollY, setScrollY] = useState(0)
	const [size, setSize] = useState({ width: 0, height: 0 })
	const resetPreferences = usePreferencesStore((state) => state.reset)
	const { idToken } = useMemberStore()
	const labelSecondaryColor = toColor(useCSSVariable('--color-label-secondary'))

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
								console.error(e)
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
			if (userKind !== USER_STUDENT) {
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
			if (userKind !== USER_STUDENT) {
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
			contentContainerClassName="pb-[60px]"
		>
			<View className="px-3">
				<SettingsHeader
					onLogout={logoutAlert}
					personalData={data}
					isLoading={isLoading}
					isSuccess={isSuccess}
					error={
						isError ? new Error(t('menu.loadPersonalDataError')) : undefined
					}
				/>
				{Platform.OS !== 'web' && idToken && <NeulandBox />}
				<View className="mt-2.5">
					{userKind === USER_GUEST ? (
						<GuestInfoSection />
					) : userKind === USER_STUDENT ? (
						<StudentInfoSection
							ects={ects}
							printerBalance={data?.pcounter?.toString() ?? '0'}
							personalLecturersCount={personalLecturers}
						/>
					) : userKind === USER_EMPLOYEE ? (
						<EmployeeInfoSection />
					) : undefined}
				</View>

				<View className="my-4 mt-6">
					<SettingsMenu />
				</View>
			</View>

			<Text className="text-label-secondary text-xs -mb-2.5 mt-3 text-center">
				{t('menu.copyright', { year: new Date().getFullYear() })}
			</Text>
			<SettingsLogo scrollY={scrollY} size={size} />
			<View className="flex-col items-center justify-center mt-[22px] gap-px">
				<Text className="text-label-secondary text-xs -mb-1.5">
					{t('menu.infrastructureBy')}
				</Text>
				<Link
					href="https://hetzner.com"
					target="_blank"
					onPress={() => {
						trackHetznerClick()
					}}
				>
					<HetznerLogo subtitleColor={String(labelSecondaryColor)} />
				</Link>
			</View>
		</ScrollView>
	)
}
