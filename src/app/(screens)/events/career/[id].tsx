import FormList from '@/components/Universal/FormList'
import { linkIcon } from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import type { FormListSections } from '@/types/components'
import { formatFriendlyDate } from '@/utils/date-utils'
import { HeaderTitle } from '@react-navigation/elements'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { Stack, useFocusEffect, useNavigation } from 'expo-router'
import type React from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Text, View } from 'react-native'
import { Linking } from 'react-native'
import { Share } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { getFragmentData } from '@/__generated__/gql'
import {
	type CareerServiceEventFieldsFragment,
	CareerServiceEventFieldsFragmentDoc,
	type CareerServiceEventsQuery
} from '@/__generated__/gql/graphql'
import neulandAPI from '@/api/neuland-api'
import ErrorView from '@/components/Error/ErrorView'
import { QUERY_KEYS } from '@/utils/events-utils'
import { trackEvent } from '@aptabase/react-native'
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'

export default function CareerServiceEvent(): React.JSX.Element {
	const { id } = useLocalSearchParams<{ id: string }>()
	const { t } = useTranslation('common')
	const { styles, theme } = useStyles(stylesheet)
	const navigation = useNavigation()
	const scrollOffset = useSharedValue(0)

	const {
		data: queryData,
		isLoading,
		error
	} = useQuery<CareerServiceEventsQuery, Error>({
		queryKey: [QUERY_KEYS.CAREER_SERVICE_EVENTS],
		queryFn: () => neulandAPI.getCareerServiceEvents()
	})

	const rawEvent = queryData?.careerServiceEvents?.find((eventCandidate) => {
		const fragment = getFragmentData(
			CareerServiceEventFieldsFragmentDoc,
			eventCandidate
		)
		return fragment?.id === id
	})

	const eventData: CareerServiceEventFieldsFragment | null = rawEvent
		? getFragmentData(CareerServiceEventFieldsFragmentDoc, rawEvent)
		: null

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollOffset.value = event.contentOffset.y
		}
	})

	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		}
	})

	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				headerRight: () => (
					<ShareHeaderButton
						onPress={async () => {
							trackEvent('Share', { type: 'careerServiceEvent' })
							const deepLinkUrl = `https://next.neuland.app/events/career-service/${id}`
							await Share.share({
								message: t('pages.event.shareMessage', {
									title: eventData?.title,
									date: formatFriendlyDate(eventData?.date ?? '')
								}),
								url: deepLinkUrl
							})
						}}
					/>
				)
			})
		}, [navigation, t, eventData, id])
	)

	if (isLoading) {
		return <LoadingIndicator />
	}

	if (error || !eventData) {
		return <ErrorView title={t('error.noData') as string} />
	}

	const sections: FormListSections[] = [
		{
			header: t('pages.event.details') as string,
			items: [
				{
					title: t('pages.event.date') as string,
					value: formatFriendlyDate(new Date(eventData.date))
				},
				{
					title: t('pages.event.registration') as string,
					value: eventData.unlimitedSlots
						? (t('pages.events.registration.unlimitedSlots') as string)
						: (t('pages.events.registration.availableSlots', {
								available: eventData.availableSlots ?? 0,
								total: eventData.totalSlots ?? 0
							}) as string)
				},
				...(eventData.waitingList != null && eventData.waitingList > 0
					? [
							{
								title: t(
									'pages.events.registration.waitingList.title'
								) as string,
								value: t('pages.events.registration.waitingList.value', {
									current: eventData.waitingList,
									max:
										eventData.maxWaitingList === null ||
										eventData.maxWaitingList === undefined
											? t('pages.events.registration.unlimitedShort')
											: eventData.maxWaitingList
								}) as string
							}
						]
					: [])
			]
		}
	]

	if (eventData.url) {
		sections.push({
			header: t('pages.event.links') as string,
			items: [
				{
					title: t('pages.event.registerNow') as string,
					icon: linkIcon,
					onPress: () => {
						if (eventData.url) {
							Linking.openURL(eventData.url)
						}
					}
				}
			]
		})
	}

	return (
		<Animated.ScrollView
			style={styles.page}
			contentContainerStyle={styles.container}
			onScroll={scrollHandler}
			scrollEventThrottle={16}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View style={styles.headerTitleContainer}>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={theme.colors.text}>
									{eventData.title}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>

			<View style={styles.titleContainerView}>
				<Text
					style={styles.titleText}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={3}
				>
					{eventData.title}
				</Text>
			</View>
			<View style={styles.formListContainer}>
				<FormList sections={sections} />
			</View>
		</Animated.ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		gap: 12,
		paddingBottom: theme.margins.modalBottomMargin
	},
	formListContainer: {
		alignSelf: 'center',
		paddingBottom: 12,
		width: '100%'
	},
	headerTitleContainer: {
		marginBottom: Platform.OS === 'ios' ? -10 : 0,
		overflow: 'hidden',
		paddingRight: Platform.OS === 'ios' ? 0 : 50
	},
	page: {
		flex: 1,
		paddingHorizontal: theme.margins.page,
		backgroundColor: theme.colors.background
	},
	titleContainerView: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	titleText: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 24,
		fontWeight: '600',
		paddingTop: 16
	}
}))
