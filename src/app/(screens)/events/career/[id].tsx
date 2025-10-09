import { trackEvent } from '@aptabase/react-native'
import { HeaderTitle } from '@react-navigation/elements'
import { useQuery } from '@tanstack/react-query'
import {
	Stack,
	useFocusEffect,
	useLocalSearchParams,
	useNavigation
} from 'expo-router'
import type React from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Share, Text, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { getFragmentData } from '@/__generated__/gql'
import {
	type CareerServiceEventFieldsFragment,
	CareerServiceEventFieldsFragmentDoc
} from '@/__generated__/gql/graphql'
import { EventErrorView } from '@/components/Error/event-error-view'
import FormList from '@/components/Universal/form-list'
import { linkIcon } from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import type { FormListSections } from '@/types/components'
import { formatFriendlyDate } from '@/utils/date-utils'
import { loadCareerServiceEvents, QUERY_KEYS } from '@/utils/events-utils'
import { getPlatformHeaderButtons } from '@/utils/header-buttons'
import { pressLink as pressLinkUtil } from '@/utils/linking'
import { copyToClipboard } from '@/utils/ui-utils'

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
	} = useQuery<
		Array<
			{ __typename?: 'CareerServiceEvent' } & {
				' $fragmentRefs'?: {
					CareerServiceEventFieldsFragment: CareerServiceEventFieldsFragment
				}
			}
		>,
		Error
	>({
		queryKey: [QUERY_KEYS.CAREER_SERVICE_EVENTS],
		queryFn: loadCareerServiceEvents
	})

	const rawEvent = queryData?.find(
		(
			eventCandidate: { __typename?: 'CareerServiceEvent' } & {
				' $fragmentRefs'?: {
					CareerServiceEventFieldsFragment: CareerServiceEventFieldsFragment
				}
			}
		) => {
			const fragment = getFragmentData(
				CareerServiceEventFieldsFragmentDoc,
				eventCandidate
			)
			return fragment?.id === id
		}
	)

	const eventData: CareerServiceEventFieldsFragment | null = rawEvent
		? getFragmentData(CareerServiceEventFieldsFragmentDoc, rawEvent)
		: null

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			if (scrollOffset && typeof scrollOffset.value !== 'undefined') {
				scrollOffset.value = event.contentOffset.y
			}
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
				...getPlatformHeaderButtons({
					onShare: async () => {
						trackEvent('Share', { type: 'careerServiceEvent' })
						const deepLinkUrl = `https://web.neuland.app/events/career/${id}`
						const message = t('pages.event.shareCareerMessage', {
							title: eventData?.title,
							date: formatFriendlyDate(eventData?.date ?? ''),
							link: deepLinkUrl
						})
						if (Platform.OS === 'web') {
							await copyToClipboard(message)
							return
						}

						await Share.share({
							message
						})
					}
				})
			})
		}, [navigation, t, eventData, id])
	)

	if (isLoading || !queryData) {
		return (
			<View style={styles.loadingContainer}>
				<LoadingIndicator />
			</View>
		)
	}

	if (error || !eventData) {
		return <EventErrorView eventType="career" />
	}

	const pressLink = (url: string | null | undefined) => {
		pressLinkUtil(url, `careerServiceEvent-${id}`)
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
						pressLink(eventData.url)
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
				<FormList sections={sections} sheet />
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
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
