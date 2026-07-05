import type { UseQueryResult } from '@tanstack/react-query'
import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { use, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Animated,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import Collapsible from 'react-native-collapsible'
import type {
	CampusType,
	UniversitySportsFieldsFragment,
	WeekdayType
} from '@/__generated__/gql/graphql'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import SportsRow from '@/components/Rows/sports-row'
import PlatformIcon from '@/components/Universal/icon'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'
import { hairlineBorder } from '@/utils/uniwind-utils'
import LoadingIndicator from '../Universal/loading-indicator'
import { EmptyEventsAnimation } from './empty-events-animation'

const sportsCampusLocations = ['Ingolstadt', 'Neuburg'] as const

export default function ClSportsPage({
	sportsResult
}: {
	sportsResult: UseQueryResult<
		{
			title: WeekdayType
			data: UniversitySportsFieldsFragment[]
		}[],
		Error
	>
}): React.JSX.Element {
	const { userCampus } = use(UserKindContext)
	const [selectedLocation, setSelectedLocation] = useState<string>('Ingolstadt')

	useEffect(() => {
		if (userCampus != null) {
			setSelectedLocation(userCampus)
		}
	}, [userCampus])

	const sportsEvents = useMemo(() => {
		if (sportsResult.data == null) {
			return []
		}
		return sportsResult.data
			.map((section) => ({
				...section,
				data: section.data.filter(
					(event) => event.campus === (selectedLocation as CampusType)
				)
			}))
			.filter((section) => section.data.length > 0)
	}, [sportsResult.data, selectedLocation])

	const { t } = useTranslation('common')

	const {
		isRefetchingByUser: isRefetchingByUserSports,
		refetchByUser: refetchByUserSports
	} = useRefreshByUser(sportsResult.refetch)
	const scrollY = new Animated.Value(0)

	const EventList = ({
		data
	}: {
		data: {
			title: WeekdayType
			data: UniversitySportsFieldsFragment[]
		}[]
	}): React.JSX.Element => {
		return (
			<View>
				{data.map((section) => (
					<SportsWeekday
						title={section.title.toLowerCase() as Lowercase<WeekdayType>}
						data={section.data}
						key={section.title}
					/>
				))}
			</View>
		)
	}

	const SportsWeekday = ({
		title,
		data
	}: {
		title: Lowercase<WeekdayType>
		data: UniversitySportsFieldsFragment[]
	}): React.JSX.Element => {
		const [collapsed, setCollapsed] = useState(false)

		return (
			<View className="mb-2.5">
				<Pressable
					onPress={() => {
						setCollapsed(!collapsed)
					}}
					style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
					hitSlop={{ top: 6, bottom: 6 }}
				>
					<View className="flex-row items-center justify-between pb-2.5">
						<Text className="text-text text-base font-semibold pt-2.5">
							{t(`dates.weekdays.${title}`)}
						</Text>
						<PlatformIcon
							ios={{
								name: collapsed ? 'chevron.down' : 'chevron.up',
								size: 13,
								weight: 'semibold'
							}}
							android={{
								name: collapsed ? 'expand_more' : 'expand_less',
								size: 20
							}}
							web={{
								name: collapsed ? 'ChevronDown' : 'ChevronUp',
								size: 20
							}}
							style={{ alignSelf: 'flex-end', marginRight: 4 }}
						/>
					</View>
				</Pressable>
				<Collapsible collapsed={collapsed}>
					<View className="rounded-md overflow-hidden">
						{data.map((event) => (
							<View key={event.id} className="mb-2">
								<SportsRow event={event} />
							</View>
						))}
					</View>
				</Collapsible>
			</View>
		)
	}

	const LocationButton = ({
		location
	}: {
		location: string
	}): React.JSX.Element => {
		const isSelected = selectedLocation === location

		return (
			<Pressable
				className="items-center bg-card border-border rounded-md justify-center p-2 px-4"
				style={hairlineBorder}
				onPress={() => {
					setSelectedLocation(location)
					if (Platform.OS === 'ios') {
						void selectionAsync()
					}
				}}
			>
				<View className="items-center relative">
					<Text className="text-transparent font-semibold">{location}</Text>
					<Text
						className={`absolute top-0 left-0 right-0 text-center ${
							isSelected ? 'text-primary font-semibold' : 'text-text'
						}`}
					>
						{location}
					</Text>
				</View>
			</Pressable>
		)
	}

	return (
		<ScrollView
			contentContainerClassName="self-center justify-center pb-bottom-safe px-page w-full"
			onScroll={Animated.event(
				[
					{
						nativeEvent: {
							contentOffset: { y: scrollY }
						}
					}
				],
				{ useNativeDriver: false }
			)}
			showsVerticalScrollIndicator={false}
			scrollEventThrottle={16}
			refreshControl={
				<RefreshControl
					refreshing={isRefetchingByUserSports}
					onRefresh={() => {
						void refetchByUserSports()
					}}
				/>
			}
		>
			{sportsResult.isLoading ? (
				<LoadingIndicator />
			) : sportsResult.isError ? (
				<ErrorView
					title={sportsResult.error?.message ?? t('error.title')}
					onButtonPress={() => {
						void refetchByUserSports()
					}}
				/>
			) : sportsResult.isPaused && !sportsResult.isSuccess ? (
				<ErrorView title={networkError} />
			) : (
				<View>
					<Text className="text-text text-base font-semibold">
						{t('labels.campus')}
					</Text>
					<View className="flex-row items-center gap-2 pb-1 pt-2">
						{sportsCampusLocations.map((location) => (
							<LocationButton location={location} key={location} />
						))}
					</View>
					<View className="rounded-md">
						{sportsResult.data != null ? (
							<EventList data={sportsEvents} />
						) : (
							<EmptyEventsAnimation
								title={t('pages.clEvents.sports.noEvents.title')}
								subtitle={t('pages.clEvents.sports.noEvents.subtitle')}
							/>
						)}
					</View>
				</View>
			)}
		</ScrollView>
	)
}
