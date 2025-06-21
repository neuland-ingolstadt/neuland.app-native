/** biome-ignore-all lint/nursery/noNestedComponentDefinitions: not a problem here */
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
	StyleSheet,
	Text,
	View
} from 'react-native'
import Collapsible from 'react-native-collapsible'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type {
	CampusType,
	UniversitySportsFieldsFragment,
	WeekdayType
} from '@/__generated__/gql/graphql'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/ErrorView'
import SportsRow from '@/components/Rows/SportsRow'
import PlatformIcon from '@/components/Universal/Icon'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'
import LoadingIndicator from '../Universal/LoadingIndicator'
import { EmptyEventsAnimation } from './EmptyEventsAnimation'

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
	const { styles } = useStyles(stylesheet)
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
	const locations = ['Ingolstadt', 'Neuburg']

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
				{data.map((section, index) => (
					<SportsWeekday
						title={section.title.toLowerCase() as Lowercase<WeekdayType>}
						data={section.data}
						key={index}
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
			<View style={styles.weekdaysContainer}>
				<Pressable
					onPress={() => {
						setCollapsed(!collapsed)
					}}
					style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
					hitSlop={{ top: 6, bottom: 6 }}
				>
					<View style={styles.categoryContainer}>
						<Text style={styles.categoryText}>
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
							style={styles.toggleIcon}
						/>
					</View>
				</Pressable>
				<Collapsible collapsed={collapsed}>
					<View style={styles.contentContainer}>
						{data.map((event, _index) => (
							<View key={event.id} style={styles.rowWrapper}>
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
				style={styles.locationButtonContainer}
				onPress={() => {
					setSelectedLocation(location)
					if (Platform.OS === 'ios') {
						void selectionAsync()
					}
				}}
			>
				<View style={styles.locationTextContainer}>
					{/* Invisible text to reserve space */}
					<Text style={styles.invisibleFont}>{location}</Text>
					<Text style={styles.locationText(isSelected)}>{location}</Text>
				</View>
			</Pressable>
		)
	}

	return (
		<ScrollView
			contentContainerStyle={styles.itemsContainer}
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
					<Text style={styles.campusHeader}>{'Campus'}</Text>
					<View style={styles.locationRow}>
						{locations.map((location, index) => (
							<LocationButton location={location} key={index} />
						))}
					</View>
					<View
						style={{
							...styles.contentBorder
						}}
					>
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

const stylesheet = createStyleSheet((theme) => ({
	campusHeader: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		verticalAlign: 'middle'
	},
	categoryContainer: {
		alignContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingBottom: 10
	},
	categoryText: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		paddingTop: 10
	},
	contentBorder: {
		borderRadius: theme.radius.md
	},
	contentContainer: {
		borderRadius: theme.radius.md,
		overflow: 'hidden'
	},
	invisibleFont: {
		color: '#00000000',
		fontWeight: '600'
	},
	itemsContainer: {
		alignSelf: 'center',
		justifyContent: 'center',
		paddingBottom: theme.margins.bottomSafeArea,
		paddingHorizontal: theme.margins.page,
		width: '100%'
	},
	locationButtonContainer: {
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderRadius: theme.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		justifyContent: 'center',
		padding: 8,
		paddingHorizontal: 16
	},
	locationRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 8,
		paddingBottom: 4,
		paddingTop: 8
	},
	locationText: (isSelect: boolean) => ({
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		textAlign: 'center',
		fontWeight: isSelect ? '600' : undefined,
		color: isSelect ? theme.colors.primary : theme.colors.text
	}),
	locationTextContainer: { alignItems: 'center', position: 'relative' },
	toggleIcon: {
		alignSelf: 'flex-end',
		marginRight: 4
	},
	weekdaysContainer: { marginBottom: 10 },
	rowWrapper: {
		marginBottom: 8
	}
}))
