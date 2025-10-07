import { useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import CLEventRow from '@/components/Rows/event-row'
import FormList from '@/components/Universal/form-list'
import { linkIcon } from '@/components/Universal/Icon'
import LinkText from '@/components/Universal/link-text'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import type { CampusLifeEvent } from '@/types/campus-life'
import type { FormListSections, SectionGroup } from '@/types/components'
import {
	loadCampusLifeEvents,
	loadCampusLifeOrganizer,
	QUERY_KEYS
} from '@/utils/events-utils'
import { isValidRoom } from '@/utils/timetable-utils'

export default function CampusLifeOrganizerScreen(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { t, i18n } = useTranslation('common')
	const { id } = useLocalSearchParams<{ id: string }>()
	const organizerId = Number(id)

	const isIdValid = Number.isInteger(organizerId)
	const organizerQuery = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_ORGANIZER, organizerId],
		queryFn: () => loadCampusLifeOrganizer(organizerId),
		enabled: isIdValid
	})

	const eventsQuery = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS, 'organizer', organizerId],
		queryFn: () => loadCampusLifeEvents({ organizerId }),
		enabled: isIdValid
	})

	if (!isIdValid) {
		return <ErrorView title={t('error.title')} />
	}

	if (organizerQuery.isLoading) {
		return (
			<View style={styles.centered}>
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
						textColor: theme.colors.primary
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
				web: 'Instagram',
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
					linkColor={theme.colors.primary}
					textStyle={styles.descriptionText}
					containerStyle={styles.linkTextContainer}
					toggleStyle={styles.showMoreButton}
				/>
			) : (
				<Text style={styles.emptyDescriptionText}>
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
		<ScrollView style={styles.page} contentContainerStyle={styles.container}>
			<View style={styles.titleContainer}>
				<Text
					style={styles.titleText}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={3}
				>
					{organizer.name}
				</Text>
			</View>

			<View style={styles.formList}>
				<FormList sections={sections} sheet />
			</View>

			<View style={styles.eventsContainer}>
				<Text style={styles.sectionTitle}>
					{t('pages.clEvents.organizer.subtitle')}
				</Text>
				{eventsQuery.isLoading ? (
					<View style={styles.centered}>
						<LoadingIndicator />
					</View>
				) : eventsQuery.isError ? (
					<Text style={styles.emptyEventsText}>
						{eventsQuery.error?.message ?? t('error.title')}
					</Text>
				) : organizerEvents.length > 0 ? (
					organizerEvents.map((event: CampusLifeEvent) => (
						<View key={event.id} style={styles.eventRow}>
							<CLEventRow event={event} inSheet />
						</View>
					))
				) : (
					<Text style={styles.emptyEventsText}>
						{t('pages.clEvents.events.noEvents.title')}.{' '}
						{t('pages.clEvents.events.noEvents.subtitle')}
					</Text>
				)}
			</View>

			{statsSections.length > 0 && (
				<View style={styles.statsFormList}>
					<FormList sections={statsSections} sheet />
				</View>
			)}
		</ScrollView>
	)
}

const isIoS26 =
	Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26

const stylesheet = createStyleSheet((theme) => ({
	centered: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center'
	},
	container: {
		gap: 12,
		paddingBottom: theme.margins.bottomSafeArea + 20
	},
	descriptionText: {
		color: theme.colors.text,
		fontSize: 16,
		textAlign: 'left'
	},
	emptyDescriptionText: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 15,
		textAlign: 'left'
	},
	emptyEventsText: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14,
		paddingTop: 8
	},
	eventRow: {},
	eventsContainer: {
		gap: 6
	},
	headerTitle: {
		alignItems: 'center',
		marginBottom: Platform.OS === 'ios' ? -10 : 0,
		overflow: 'hidden',
		paddingRight: Platform.OS === 'ios' ? 0 : 50
	},
	headerSubtitle: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 12,
		fontWeight: '400',
		marginTop: -2
	},
	page: {
		flex: 1,
		paddingHorizontal: theme.margins.page
	},
	sectionTitle: {
		color: theme.colors.text,
		fontSize: 20,
		fontWeight: '600'
	},
	formList: {
		alignSelf: 'center',
		width: '100%',
		paddingBottom: 12
	},
	statsFormList: {
		alignSelf: 'center',
		width: '100%',
		paddingTop: 12
	},
	titleContainer: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	titleText: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 26,
		fontWeight: '600',
		paddingTop: 16,
		marginLeft: isIoS26 ? 6 : 0,
		textAlign: 'left'
	},
	linkTextContainer: {
		gap: 8
	},
	showMoreButton: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: '600'
	}
}))
