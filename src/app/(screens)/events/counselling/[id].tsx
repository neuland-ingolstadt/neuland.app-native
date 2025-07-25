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
import { Linking, Platform, Share, Text, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { getFragmentData } from '@/__generated__/gql'
import {
	type StudentCounsellingEventFieldsFragment,
	StudentCounsellingEventFieldsFragmentDoc
} from '@/__generated__/gql/graphql'
import { EventErrorView } from '@/components/Error/event-error-view'
import FormList from '@/components/Universal/FormList'
import { linkIcon } from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import type { FormListSections } from '@/types/components'
import { formatFriendlyDate } from '@/utils/date-utils'
import { loadStudentCounsellingEvents, QUERY_KEYS } from '@/utils/events-utils'
import { copyToClipboard } from '@/utils/ui-utils'

export default function StudentCounsellingEventDetail(): React.JSX.Element {
	const { t } = useTranslation('common')
	const { styles, theme } = useStyles(stylesheet)
	const { id } = useLocalSearchParams<{ id: string }>()

	const {
		data: queryData,
		isLoading,
		error
	} = useQuery<
		Array<
			{ __typename?: 'StudentCounsellingEvent' } & {
				' $fragmentRefs'?: {
					StudentCounsellingEventFieldsFragment: StudentCounsellingEventFieldsFragment
				}
			}
		>,
		Error
	>({
		queryKey: [QUERY_KEYS.STUDENT_ADVISORY_EVENTS],
		queryFn: loadStudentCounsellingEvents
	})

	const rawEvent = queryData?.find(
		(
			eventCandidate: { __typename?: 'StudentCounsellingEvent' } & {
				' $fragmentRefs'?: {
					StudentCounsellingEventFieldsFragment: StudentCounsellingEventFieldsFragment
				}
			}
		) => {
			const fragment = getFragmentData(
				StudentCounsellingEventFieldsFragmentDoc,
				eventCandidate
			)
			return fragment?.id === id
		}
	)
	const eventData: StudentCounsellingEventFieldsFragment | null = rawEvent
		? getFragmentData(StudentCounsellingEventFieldsFragmentDoc, rawEvent)
		: null

	const scrollOffset = useSharedValue(0)
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: ({ contentOffset }) => {
			if (scrollOffset && typeof scrollOffset.value !== 'undefined') {
				scrollOffset.value = contentOffset.y
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

	const navigation = useNavigation()

	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				headerRight: () => (
					<ShareHeaderButton
						onPress={async () => {
							trackEvent('Share', {
								type: 'studentCounsellingEvent'
							})
							const deepLinkUrl = `https://web.neuland.app/events/counselling/${id}`
							const message = t('pages.event.shareCounsellingMessage', {
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
						}}
					/>
				)
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
		return <EventErrorView eventType="counselling" />
	}

	const sections: FormListSections[] = [
		{
			header: t('pages.event.details') as string,
			items: [
				{
					title: t('pages.event.date') as string,
					value: formatFriendlyDate(eventData.date)
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
		},
		...(eventData.url
			? [
					{
						header: t('pages.event.links') as string,
						items: [
							{
								title: t('pages.event.registerNow') as string,
								icon: linkIcon,
								onPress: () => {
									if (eventData.url) {
										void Linking.openURL(eventData.url)
									}
								}
							}
						]
					}
				]
			: [])
	]

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
						<View style={styles.headerTitle}>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={theme.colors.text}>
									{eventData.title}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>

			<View style={styles.titleContainer}>
				<Text
					style={styles.titleText}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={3}
				>
					{eventData.title}
				</Text>
			</View>
			<View style={styles.formList}>
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
	formList: {
		alignSelf: 'center',
		paddingBottom: 12,
		width: '100%'
	},
	headerTitle: {
		marginBottom: Platform.OS === 'ios' ? -10 : 0,
		overflow: 'hidden',
		paddingRight: Platform.OS === 'ios' ? 0 : 50
	},
	page: {
		paddingHorizontal: theme.margins.page
	},
	titleContainer: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	titleText: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 24,
		fontWeight: '600',
		paddingTop: 16,
		textAlign: 'left'
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
