import { useQuery } from '@tanstack/react-query'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, ScrollView, Text, View } from 'react-native'
import { useCSSVariable, useResolveClassNames } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import CLEventRow from '@/components/Rows/event-row'
import FormList from '@/components/Universal/form-list'
import { linkIcon } from '@/components/Universal/icon'
import LinkText from '@/components/Universal/link-text'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useFeatureFlagEnabled } from '@/hooks'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import type {
	CampusLifeEvent,
	CampusLifePublicOrganizerKind
} from '@/types/campus-life'
import type { FormListSections, SectionGroup } from '@/types/components'
import {
	isThiDepartmentOrganizerKind,
	parseCampusLifeOrganizerKindParam
} from '@/utils/campus-life-utils'
import {
	loadCampusLifeEvents,
	loadCampusLifeOrganizer,
	QUERY_KEYS
} from '@/utils/events-utils'
import { isValidRoom } from '@/utils/timetable-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function CampusLifeOrganizerScreen(): React.JSX.Element {
	const { t, i18n } = useTranslation('common')
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const descriptionTextStyle = useResolveClassNames(
		'text-text text-base text-left'
	)
	const showMoreButtonStyle = useResolveClassNames(
		'text-primary text-sm font-semibold'
	)
	const { id, org: orgParam } = useLocalSearchParams<{
		id: string
		org?: string | string[]
	}>()
	const paramOrganizerKind = parseCampusLifeOrganizerKindParam(orgParam)
	const { enabled: thiEventsVisible, isPending: thiFlagPending } =
		useFeatureFlagEnabled(FeatureFlagKeys.thiEventsVisible)
	const organizerId = Number(id)

	const isIdValid = Number.isInteger(organizerId)
	const organizerQuery = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_ORGANIZER, organizerId],
		queryFn: () => loadCampusLifeOrganizer(organizerId),
		enabled: isIdValid
	})

	const eventsQuery = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS, 'organizer', organizerId],
		queryFn: () => loadCampusLifeEvents({ organizerId, organizerKind: null }),
		enabled: isIdValid
	})

	if (!isIdValid) {
		return <ErrorView title={t('error.title')} />
	}

	if (organizerQuery.isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<LoadingIndicator />
			</View>
		)
	}

	if (organizerQuery.isError || organizerQuery.data == null) {
		return (
			<ErrorView title={organizerQuery.error?.message ?? t('error.title')} />
		)
	}

	const organizer = organizerQuery.data
	const organizerKind: CampusLifePublicOrganizerKind =
		organizer.organizerKind ?? paramOrganizerKind

	if (isThiDepartmentOrganizerKind(organizerKind)) {
		if (thiFlagPending) {
			return (
				<View className="flex-1 items-center justify-center">
					<LoadingIndicator />
				</View>
			)
		}

		if (!thiEventsVisible) {
			return <Redirect href="/(tabs)" />
		}
	}

	const locale: 'de' | 'en' = i18n.language.startsWith('de') ? 'de' : 'en'
	const description =
		organizer.descriptions[locale] ??
		organizer.descriptions.en ??
		organizer.descriptions.de ??
		''

	const infoItems: SectionGroup[] = []
	if (organizer.location) {
		infoItems.push({
			title: t('pages.event.organizerDetails.location'),
			value: organizer.location,
			...(isValidRoom(organizer.location)
				? {
						onPress: () => {
							router.dismissTo({
								pathname: '/map',
								params: {
									room: organizer.location
								}
							})
						},
						textColor: primaryColor
					}
				: {})
		})
	}

	const statsItems: SectionGroup[] = []
	if (organizer.registrationNumber) {
		statsItems.push({
			title: t('pages.event.organizerDetails.registrationNumber'),
			value: organizer.registrationNumber
		})
	}

	if (organizer.nonProfit != null) {
		statsItems.push({
			title: t('pages.event.organizerDetails.nonProfit.label'),
			value: organizer.nonProfit
				? t('pages.event.organizerDetails.nonProfit.yes')
				: t('pages.event.organizerDetails.nonProfit.no')
		})
	}

	const linkItems: SectionGroup[] = []

	if (organizer.website) {
		linkItems.push({
			title: t('pages.event.organizerDetails.clubWebsite'),
			icon: linkIcon,
			onPress: () => {
				void Linking.openURL(organizer.website as string)
			}
		})
	}

	if (organizer.instagram) {
		linkItems.push({
			title: t('pages.event.organizerDetails.instagram'),
			icon: {
				ios: 'instagram',
				android: 'instagram',
				web: 'instagram',
				iosFallback: true
			},
			onPress: () => {
				void Linking.openURL(organizer.instagram as string)
			}
		})
	}

	if (organizer.linkedin) {
		linkItems.push({
			title: t('pages.event.organizerDetails.linkedin'),
			icon: linkIcon,
			onPress: () => {
				void Linking.openURL(organizer.linkedin as string)
			}
		})
	}

	const sections: FormListSections[] = []
	sections.push({
		header: t('pages.event.description'),
		item:
			description.trim() !== '' ? (
				<LinkText
					text={description}
					linkColor={String(primaryColor)}
					textStyle={descriptionTextStyle}
					containerStyle={{ gap: 8 }}
					toggleStyle={showMoreButtonStyle}
				/>
			) : (
				<Text className="text-label-secondary text-[15px] text-left">
					{t('pages.event.organizerDetails.noDescription')}
				</Text>
			)
	})
	if (linkItems.length > 0) {
		sections.push({
			header: t('pages.event.links'),
			items: linkItems
		})
	}
	if (infoItems.length > 0) {
		sections.push({
			header: t('pages.event.organizerDetails.info'),
			items: infoItems
		})
	}

	const statsSections: FormListSections[] = []
	if (statsItems.length > 0) {
		statsSections.push({
			header: t('pages.event.organizerDetails.stats' as const),
			items: statsItems
		})
	}

	const organizerEvents = eventsQuery.data ?? []

	return (
		<ScrollView
			className="flex-1 px-page"
			contentContainerClassName="gap-3 pb-bottom-safe"
		>
			<View className="flex-row items-start justify-between">
				<Text
					className="text-text flex-1 text-[26px] font-semibold pt-4 text-left"
					style={{
						marginLeft:
							Platform.OS === 'ios' &&
							Number.parseInt(Platform.Version, 10) >= 26
								? 6
								: 0
					}}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={3}
				>
					{organizer.name}
				</Text>
			</View>

			<View className="self-center w-full pb-3">
				<FormList sections={sections} sheet />
			</View>

			<View className="gap-1.5">
				<Text className="text-text text-xl font-semibold">
					{t('pages.clEvents.organizer.subtitle')}
				</Text>
				{eventsQuery.isLoading ? (
					<View className="flex-1 items-center justify-center">
						<LoadingIndicator />
					</View>
				) : eventsQuery.isError ? (
					<Text className="text-label-secondary text-sm pt-2">
						{eventsQuery.error?.message ?? t('error.title')}
					</Text>
				) : organizerEvents.length > 0 ? (
					organizerEvents.map((event: CampusLifeEvent) => (
						<View key={event.id}>
							<CLEventRow event={event} inSheet organizerKind={organizerKind} />
						</View>
					))
				) : (
					<Text className="text-label-secondary text-sm pt-2">
						{t('pages.clEvents.events.noEvents.title')}.{' '}
						{t('pages.clEvents.events.noEvents.subtitle')}
					</Text>
				)}
			</View>

			{statsSections.length > 0 && (
				<View className="self-center w-full pt-3">
					<FormList sections={statsSections} sheet />
				</View>
			)}
		</ScrollView>
	)
}
