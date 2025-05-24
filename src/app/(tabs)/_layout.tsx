import TabLayout from '@/components/Layout/Tabbar'
import { UserKindContext } from '@/components/contexts'
import changelog from '@/data/changelog.json'
import { USER_GUEST } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useSessionStore } from '@/hooks/useSessionStore'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { humanLocations } from '@/utils/food-utils'
import { storage } from '@/utils/storage'
import Aptabase from '@aptabase/react-native'
import * as Application from 'expo-application'
import * as QuickActions from 'expo-quick-actions'
import { Redirect, type RelativePathString, useRouter } from 'expo-router'
import type React from 'react'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

import Constants from 'expo-constants'
import { appIcons } from '../(screens)/app-icon'

export default function HomeLayout(): React.JSX.Element {
	const router = useRouter()

	const { t } = useTranslation('navigation')
	const selectedRestaurants = useFoodFilterStore(
		(state) => state.selectedRestaurants
	)
	const appIcon = usePreferencesStore((state) => state.appIcon)
	const setAppIcon = usePreferencesStore((state) => state.setAppIcon)
	const aptabaseKey = process.env.EXPO_PUBLIC_APTABASE_KEY

	const analyticsInitialized = useSessionStore(
		(state) => state.analyticsInitialized
	)
	const initializeAnalytics = useSessionStore(
		(state) => state.initializeAnalytics
	)
	const analyticsAllowed = useFlowStore((state) => state.analyticsAllowed)
	const setAnalyticsAllowed = useFlowStore((state) => state.setAnalyticsAllowed)
	const isOnboarded = useFlowStore((state) => state.isOnboarded)
	const setOnboarded = useFlowStore((state) => state.setOnboarded)
	const toggleSelectedAllergens = useFoodFilterStore(
		(state) => state.toggleSelectedAllergens
	)
	const { userKind: userKindInitial } = useContext(UserKindContext)
	const userKind = userKindInitial ?? USER_GUEST
	const updatedVersion = useFlowStore((state) => state.updatedVersion)
	const [isOnboardedV1] = useMMKVBoolean('isOnboardedv1')
	const [analyticsV1] = useMMKVBoolean('analytics')
	const oldAllergens = storage.getString('selectedUserAllergens')
	// migration of old settings
	if (isOnboardedV1 === true) {
		setOnboarded()
		storage.delete('isOnboardedv1')
	}
	if (analyticsV1 === true) {
		setAnalyticsAllowed(true)
		storage.delete('analytics')
	}

	if (oldAllergens != null) {
		const allergens = JSON.parse(oldAllergens) as string[]
		if (allergens.length === 1 && allergens[0] === 'not-configured') {
			/* empty */
		} else {
			for (const allergen of allergens) {
				console.debug('Migrating allergen:', allergen)
				toggleSelectedAllergens(allergen)
			}
		}
		storage.delete('selectedUserAllergens')
	}

	const version = Application.nativeApplicationVersion
	const processedVersion = convertToMajorMinorPatch(version ?? '0.0.0')
	const isChangelogAvailable =
		version != null
			? Object.keys(changelog.version).some(
					(changelogVersion) => changelogVersion === processedVersion
				)
			: false

	useEffect(() => {
		if (Platform.OS === 'web') {
			return
		}

		const shortcuts = [
			{
				id: 'timetable',
				title: t('navigation.timetable'),
				icon: Platform.OS === 'ios' ? 'symbol:calendar' : 'calendar',
				params: { href: '(tabs)/timetable' }
			},
			{
				id: 'food',
				title:
					selectedRestaurants.length !== 1
						? t('navigation.food')
						: humanLocations[
								selectedRestaurants[0] as keyof typeof humanLocations
							],
				icon: Platform.OS === 'ios' ? 'symbol:fork.knife' : 'food',
				params: { href: '(tabs)/food' }
			},
			{
				id: 'links',
				title: t('cards.titles.links'),
				icon: Platform.OS === 'ios' ? 'symbol:link' : 'link',
				params: { href: '/links' }
			},
			...(userKind === USER_GUEST
				? [
						{
							id: 'login',
							title: t('navigation.login'),
							icon:
								Platform.OS === 'ios'
									? 'symbol:person.crop.circle.badge.questionmark'
									: 'account',
							params: { href: 'login' }
						}
					]
				: [
						{
							id: 'profile',
							title: t('navigation.profile'),
							icon: Platform.OS === 'ios' ? 'symbol:person.circle' : 'account',
							params: { href: 'profile' }
						}
					])
		]

		const subscription = QuickActions.addListener((action) => {
			if (action?.params?.href) {
				router.navigate({
					pathname: action.params.href as RelativePathString
				})
			}
		})
		QuickActions.setItems(shortcuts).catch(console.error)

		return () => {
			subscription.remove()
		}
	}, [selectedRestaurants, router, t, userKind])

	useEffect(() => {
		console.debug('Analytics allowed:', analyticsAllowed)
		if (aptabaseKey != null && analyticsAllowed === true) {
			Aptabase.init(aptabaseKey, {
				host: 'https://analytics.neuland.app',
				appVersion:
					Platform.OS === 'web'
						? `${Constants.expoConfig?.version}-web`
						: undefined,
				enableWeb: true
			})
			// we need to mark the analytics as initialized to trigger the initial events sent in provider.tsx
			initializeAnalytics()
			console.debug('Initialized analytics')
		} else if (
			aptabaseKey != null &&
			analyticsAllowed === false &&
			analyticsInitialized
		) {
			Aptabase.dispose()
			console.debug('Disposed analytics')
		} else {
			console.debug('Analytics not initialized / allowed')
		}
	}, [analyticsAllowed])
	useEffect(() => {
		if (Platform.OS !== 'ios') return

		if (!appIcons.includes(appIcon ?? 'default')) {
			setAppIcon('default')
		}
	}, [appIcon])

	if (Platform.OS === 'web') {
		if (userKindInitial === undefined) {
			return <Redirect href={'/login'} />
		}
	} else {
		if (isOnboarded !== true) {
			return <Redirect href={'/onboarding'} />
		}

		if (
			updatedVersion !== processedVersion &&
			isChangelogAvailable &&
			isOnboarded
		) {
			return <Redirect href={'/whatsnew'} />
		}
	}

	return <TabLayout />
}
