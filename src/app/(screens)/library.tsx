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
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/ErrorView'
import LibraryCard from '@/components/Library/LibraryCard'
import FormList from '@/components/Universal/FormList'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
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
	const { styles } = useStyles(stylesheet)
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
			staleTime: 1000 * 60 * 60 * 12, // 12 hours
			gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
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

	const hasBibNumber = (data?.bibnr ?? '').trim() !== ''

	const sections: FormListSections[] = hasBibNumber
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
		<View>
			{userKind === USER_GUEST ? (
				<ErrorView title={guestError} />
			) : userKind === USER_EMPLOYEE ? (
				<ErrorView title={permissionError} />
			) : isLoading ? (
				<View style={styles.loadingContainer}>
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
			) : isSuccess && hasBibNumber ? (
				<View style={styles.container}>
					<View>
						<FormList sections={sections} />
					</View>
					<Pressable
						style={{
							...styles.barcodeContainer,
							backgroundColor: staticColors.white
						}}
						onPress={() => {
							void toggleBrightness()
						}}
					>
						<Barcode
							format="CODE39"
							value={data.bibnr ?? ''}
							maxWidth={Dimensions.get('window').width - 56}
							width={5}
							style={styles.barcodeStyle}
						/>
					</Pressable>
					<View style={styles.notesContainer}>
						<Text style={styles.notesText}>
							{t('pages.library.code.footer')}
						</Text>
					</View>
				</View>
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
				<View style={[styles.container, styles.linksContainer]}>
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
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	barcodeContainer: {
		alignSelf: 'center',
		borderRadius: theme.radius.mg,
		marginHorizontal: theme.margins.page,
		marginTop: 20,
		paddingVertical: 14,
		width: '100%'
	},
	barcodeStyle: {
		alignSelf: 'center',
		marginVertical: 6,
		paddingHorizontal: 10
	},
	container: {
		alignSelf: 'center',
		paddingHorizontal: theme.margins.page,
		paddingVertical: 16,
		width: '100%'
	},
	loadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 40
	},
	linksContainer: {
		gap: theme.margins.page,
		width: '100%'
	},
	notesContainer: {
		alignSelf: 'center',
		marginBottom: 40,
		marginTop: 14,
		width: '100%'
	},
	notesText: {
		color: theme.colors.labelColor,
		fontSize: 12,
		textAlign: 'left'
	}
}))
