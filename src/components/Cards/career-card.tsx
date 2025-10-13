import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { getFragmentData } from '@/__generated__/gql'
import {
	type CareerServiceEventFieldsFragment,
	CareerServiceEventFieldsFragmentDoc,
	type StudentCounsellingEventFieldsFragment,
	StudentCounsellingEventFieldsFragmentDoc
} from '@/__generated__/gql/graphql'
import {
	loadCareerServiceEvents,
	loadStudentCounsellingEvents,
	QUERY_KEYS
} from '@/utils/events-utils'
import EventItem from '../Universal/event-item'
import BaseCard from './base-card'

const CareerCard = (): React.JSX.Element => {
	const { theme, styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const careerServiceQuery = useQuery<
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
		queryFn: loadCareerServiceEvents,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 60 * 24
	})

	const studentCounsellingQuery = useQuery<
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
		queryFn: loadStudentCounsellingEvents,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 60 * 24
	})

	const careerServiceEvents: CareerServiceEventFieldsFragment[] = (
		Array.isArray(careerServiceQuery.data)
			? careerServiceQuery.data.map((event) =>
					getFragmentData(CareerServiceEventFieldsFragmentDoc, event)
				)
			: []
	).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

	const studentCounsellingEvents: StudentCounsellingEventFieldsFragment[] = (
		Array.isArray(studentCounsellingQuery.data)
			? studentCounsellingQuery.data.map((event) =>
					getFragmentData(StudentCounsellingEventFieldsFragmentDoc, event)
				)
			: []
	).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

	const handleEventItemPress = (id: string, studentCounselling?: boolean) => {
		if (Platform.OS !== 'ios') {
			if (studentCounselling) {
				router.navigate({
					pathname: '/events/counselling/[id]',
					params: { id }
				})
			} else {
				router.navigate({
					pathname: '/events/career/[id]',
					params: { id }
				})
			}
			return
		}

		router.navigate({
			pathname: '/thi-services',
			params: {
				openEvent: 'true',
				id,
				tab: studentCounselling ? 'student-counselling' : undefined
			}
		})
	}

	const noData = <Text style={styles.noDataTitle}>{t('error.noEvents')}</Text>

	// Determine which events to show based on availability
	const hasCareerServiceEvents = careerServiceEvents.length > 0
	const hasStudentCounsellingEvents = studentCounsellingEvents.length > 0

	// Logic: if one type has no events, show two of the other type
	const eventsToShow = (() => {
		if (!hasCareerServiceEvents && hasStudentCounsellingEvents) {
			// No career service events, show two student counselling events
			return studentCounsellingEvents.slice(0, 2).map((event, index) => (
				<Pressable
					key={`student-counselling-${event.id}-${index}`}
					onPress={() => handleEventItemPress(event.id, true)}
				>
					<EventItem
						title={event.title}
						subtitle={t('pages.events.studentCounselling.title')}
						startDateTime={event.date ? new Date(event.date) : undefined}
						subtitleTranslationKey="pages.events.studentCounselling.title"
						color={theme.colors.primary}
					/>
				</Pressable>
			))
		}
		if (!hasStudentCounsellingEvents && hasCareerServiceEvents) {
			// No student counselling events, show two career service events
			return careerServiceEvents.slice(0, 2).map((event, index) => (
				<Pressable
					key={`career-service-${event.id}-${index}`}
					onPress={() => handleEventItemPress(event.id)}
				>
					<EventItem
						title={event.title}
						subtitle={t('pages.events.careerService.title')}
						startDateTime={event.date ? new Date(event.date) : undefined}
						subtitleTranslationKey="pages.events.careerService.title"
						color={theme.colors.primary}
					/>
				</Pressable>
			))
		}
		// Both types have events, show one of each (original behavior)
		return [
			careerServiceEvents[0] && (
				<Pressable
					key={`career-service-${careerServiceEvents[0].id}`}
					onPress={() => handleEventItemPress(careerServiceEvents[0].id)}
				>
					<EventItem
						title={careerServiceEvents[0].title}
						subtitle={t('pages.events.careerService.title')}
						startDateTime={
							careerServiceEvents[0].date
								? new Date(careerServiceEvents[0].date)
								: undefined
						}
						subtitleTranslationKey="pages.events.careerService.title"
						color={theme.colors.primary}
					/>
				</Pressable>
			),
			studentCounsellingEvents[0] && (
				<Pressable
					key={`student-counselling-${studentCounsellingEvents[0].id}`}
					onPress={() =>
						handleEventItemPress(studentCounsellingEvents[0].id, true)
					}
				>
					<EventItem
						title={studentCounsellingEvents[0].title}
						subtitle={t('pages.events.studentCounselling.title')}
						startDateTime={
							studentCounsellingEvents[0].date
								? new Date(studentCounsellingEvents[0].date)
								: undefined
						}
						subtitleTranslationKey="pages.events.studentCounselling.title"
						color={theme.colors.primary}
					/>
				</Pressable>
			)
		].filter(Boolean)
	})()

	return (
		<BaseCard
			title="thiServices"
			onPressRoute="/thi-services"
			noDataComponent={noData}
			noDataPredicate={() =>
				careerServiceQuery.isSuccess &&
				studentCounsellingQuery.isSuccess &&
				careerServiceEvents.length === 0 &&
				studentCounsellingEvents.length === 0
			}
		>
			<View style={styles.eventsContainer}>{eventsToShow}</View>
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	eventsContainer: {
		marginTop: 10,
		gap: 12
	},
	noDataTitle: {
		marginTop: 10,
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '500'
	}
}))

export default CareerCard
