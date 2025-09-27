import { HeaderTitle } from '@react-navigation/elements'
import { useQuery } from '@tanstack/react-query'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import CLEventRow from '@/components/Rows/event-row'
import FormList from '@/components/Universal/form-list'
import { linkIcon } from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import type { CampusLifeEvent } from '@/types/campus-life'
import type { FormListSections, SectionGroup } from '@/types/components'
import {
	loadCampusLifeEvents,
	loadCampusLifeOrganizer,
	QUERY_KEYS
} from '@/utils/events-utils'
import { isValidRoom } from '@/utils/timetable-utils'

const URL_REGEX = /(https?:\/\/[^\s]+)/g

const LinkText: React.FC<{ text: string; color: string }> = ({
	text,
	color
}) => {
	const { styles } = useStyles(stylesheet)
	const parts = useMemo(() => text.split(URL_REGEX), [text])

	return (
		<Text style={styles.descriptionText}>
			{parts.map((part, index) => {
				if (part.match(URL_REGEX)) {
					return (
						<Text
							key={index}
							onPress={() => {
								void Linking.openURL(part)
							}}
							style={{ color }}
						>
							{part}
						</Text>
					)
				}
				return <Text key={index}>{part}</Text>
			})}
		</Text>
	)
}

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

	const linkItems: SectionGroup[] = []

	if (organizer.website) {
		linkItems.push({
			title: t('pages.event.organizerDetails.website'),
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

	const sections: FormListSections[] = []
	sections.push({
		header: t('pages.event.description'),
		item:
			description.trim() !== '' ? (
				<LinkText text={description} color={theme.colors.primary} />
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

	const organizerEvents = eventsQuery.data ?? []

	return (
		<ScrollView style={styles.page} contentContainerStyle={styles.container}>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View style={styles.headerTitle}>
							<HeaderTitle {...props} tintColor={theme.colors.text}>
								{organizer.name}
							</HeaderTitle>
						</View>
					)
				}}
			/>

			<View style={styles.titleContainer}>
				<Text style={styles.titleText}>{organizer.name}</Text>
			</View>

			<View style={styles.sectionSpacing}>
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
						{t('pages.clEvents.events.noEvents.subtitle')}
					</Text>
				)}
			</View>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	centered: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center'
	},
	container: {
		gap: 20,
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
		gap: 12
	},
	headerTitle: {
		paddingRight: Platform.OS === 'ios' ? 0 : 32
	},
	page: {
		flex: 1,
		paddingHorizontal: theme.margins.page
	},
	sectionSpacing: {
		gap: 12
	},
	sectionTitle: {
		color: theme.colors.text,
		fontSize: 20,
		fontWeight: '600'
	},
	titleContainer: {
		paddingTop: 16
	},
	titleText: {
		color: theme.colors.text,
		fontSize: 26,
		fontWeight: '600'
	}
}))
