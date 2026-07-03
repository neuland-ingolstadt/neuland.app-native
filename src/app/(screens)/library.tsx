import Barcode from '@kichiyaki/react-native-barcode-generator'
import { useQuery } from '@tanstack/react-query'
import * as Brightness from 'expo-brightness'
import { useFocusEffect } from 'expo-router'
import React, { use, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Dimensions,
	Linking,
	Platform,
	Pressable,
	Text,
	View
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import LibraryCard from '@/components/Library/library-card'
import FormList from '@/components/Universal/form-list'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import {
	libraryLink,
	USER_EMPLOYEE,
	USER_GUEST,
	USER_STUDENT,
	vscoutLink
} from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import type { FormListSections } from '@/types/components'
import {
	getPersonalData,
	guestError,
	networkError,
	permissionError
} from '@/utils/api-utils'

export default function LibraryCode(): React.JSX.Element {
	const { t } = useTranslation('common')
	const { userKind = USER_GUEST } = use(UserKindContext)
	const [brightness, setBrightness] = useState<number>(0)
	const brightnessRef = useRef<number>(0)

	const staticColors = {
		white: '#ffffff'
	}

	const { data, isLoading, isError, isPaused, error, isSuccess, refetch } =
		useQuery({
			queryKey: ['personalData'],
			queryFn: getPersonalData,
			staleTime: 1000 * 60 * 60 * 12,
			gcTime: 1000 * 60 * 60 * 24 * 60,
			enabled: userKind === USER_STUDENT
		})

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

	useEffect(() => {
		brightnessRef.current = brightness
	}, [brightness])

	useFocusEffect(
		React.useCallback(() => {
			if (Platform.OS === 'ios') {
				return () => {
					void Brightness.setSystemBrightnessAsync(brightnessRef.current)
				}
			}
		}, [])
	)

	useEffect(() => {
		if (Platform.OS === 'ios') {
			void (async () => {
				const { status } = await Brightness.requestPermissionsAsync()
				if (status === 'granted') {
					const value = await Brightness.getSystemBrightnessAsync()
					setBrightness(value)

					void Brightness.setSystemBrightnessAsync(1)
				}
			})()
		}
	}, [])

	const isBibNumberPresent = (data?.bibnr ?? '').trim() !== ''

	const sections: FormListSections[] = isBibNumberPresent
		? [
				{
					header: t('profile.formlist.user.library', { ns: 'settings' }),
					items: [
						{
							title: t('pages.library.code.number'),
							value: data?.bibnr ?? ''
						}
					]
				}
			]
		: []

	const toggleBrightness = async (): Promise<void> => {
		if (Platform.OS !== 'ios') {
			return
		}
		if ((await Brightness.getSystemBrightnessAsync()) === 1) {
			void Brightness.setSystemBrightnessAsync(brightness)
		} else {
			void Brightness.setSystemBrightnessAsync(1)
		}
	}
	return (
		<SafeAreaProvider>
			{userKind === USER_GUEST ? (
				<ErrorView title={guestError} />
			) : userKind === USER_EMPLOYEE ? (
				<ErrorView title={permissionError} />
			) : isLoading ? (
				<View className="items-center justify-center py-10">
					<LoadingIndicator />
				</View>
			) : isError ? (
				<ErrorView
					title={error.message ?? t('error.title')}
					onRefresh={refetchByUser}
					refreshing={isRefetchingByUser}
				/>
			) : isPaused && !isSuccess ? (
				<ErrorView
					title={networkError}
					onRefresh={refetchByUser}
					refreshing={isRefetchingByUser}
				/>
			) : isSuccess && isBibNumberPresent ? (
				<SafeAreaView className="self-center px-page py-4 w-full">
					<View>
						<FormList sections={sections} />
					</View>
					<Pressable
						className="self-center rounded-mg mx-page mt-5 py-3.5 w-full"
						style={{ backgroundColor: staticColors.white }}
						onPress={() => {
							void toggleBrightness()
						}}
					>
						<Barcode
							format="CODE39"
							value={data.bibnr ?? ''}
							maxWidth={Dimensions.get('window').width - 56}
							width={5}
							style={{
								alignSelf: 'center',
								marginVertical: 6,
								paddingHorizontal: 10
							}}
						/>
					</Pressable>
					<View className="self-center mb-2.5 mt-3.5 w-full">
						<Text className="text-label text-xs text-left">
							{t('pages.library.code.footer')}
						</Text>
					</View>
				</SafeAreaView>
			) : isSuccess ? null : (
				<ErrorView
					title={
						// @ts-expect-error error is type never
						error?.message
							? // @ts-expect-error error is type never
								((error.message as string) ?? t('error.title'))
							: t('error.title')
					}
					onRefresh={refetchByUser}
					refreshing={isRefetchingByUser}
				/>
			)}
			{userKind === USER_STUDENT && (
				<View className="self-center px-page py-4 gap-page w-full">
					<LibraryCard
						onPress={() => {
							Linking.openURL(vscoutLink).catch((err) => {
								console.error(err)
							})
						}}
						iconProps={{
							ios: { name: 'studentdesk', size: 18 },
							android: {
								name: 'chair',
								size: 22,
								variant: 'outlined'
							},
							web: { name: 'Armchair', size: 20 }
						}}
						title={t('pages.library.seatReservation.title')}
						description={t('pages.library.seatReservation.description')}
					/>
					<LibraryCard
						onPress={() => {
							Linking.openURL(libraryLink).catch((err) => {
								console.error(err)
							})
						}}
						iconProps={{
							ios: { name: 'text.magnifyingglass', size: 18 },
							android: {
								name: 'library_books',
								size: 22,
								variant: 'outlined'
							},
							web: { name: 'Search', size: 20 }
						}}
						title={t('pages.library.catalog.title')}
						description={t('pages.library.catalog.description')}
					/>
				</View>
			)}
		</SafeAreaProvider>
	)
}
