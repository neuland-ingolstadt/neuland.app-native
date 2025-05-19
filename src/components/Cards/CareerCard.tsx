import { getFragmentData } from '@/__generated__/gql'
import {
	CareerServiceEventFieldsFragmentDoc,
	StudentAdvisoryEventFieldsFragmentDoc,
	type CareerServiceEventFieldsFragment,
	type StudentAdvisoryEventFieldsFragment,
	type CareerServiceEventsQuery,
	type StudentAdvisoryEventsQuery
} from '@/__generated__/gql/graphql'
import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import BaseCard from './BaseCard'
import LoadingIndicator from '../Universal/LoadingIndicator'
import EventItem from '../Universal/EventItem'
import { QUERY_KEYS } from '@/utils/events-utils'
import neulandAPI from '@/api/neuland-api'

const CareerCard = (): React.JSX.Element => {
	const { theme, styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const careerServiceQuery = useQuery<CareerServiceEventsQuery, Error>({
		queryKey: [QUERY_KEYS.CAREER_SERVICE_EVENTS],
		queryFn: () => neulandAPI.getCareerServiceEvents(),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 60 * 24
	})

	const studentAdvisoryQuery = useQuery<StudentAdvisoryEventsQuery, Error>({
		queryKey: [QUERY_KEYS.STUDENT_ADVISORY_EVENTS],
		queryFn: () => neulandAPI.getStudentAdvisoryEvents(),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 60 * 24
	})

	const rawCareerEvents = careerServiceQuery.data?.careerServiceEvents
	const careerServiceEvents: CareerServiceEventFieldsFragment[] = Array.isArray(
		rawCareerEvents
	)
		? rawCareerEvents.map((event) =>
				getFragmentData(CareerServiceEventFieldsFragmentDoc, event)
			)
		: []

	const rawStudentAdvisoryEvents =
		studentAdvisoryQuery.data?.studentAdvisoryEvents
	const studentAdvisoryEvents: StudentAdvisoryEventFieldsFragment[] =
		Array.isArray(rawStudentAdvisoryEvents)
			? rawStudentAdvisoryEvents.map((event) =>
					getFragmentData(StudentAdvisoryEventFieldsFragmentDoc, event)
				)
			: []

	const isLoading =
		careerServiceQuery.isLoading || studentAdvisoryQuery.isLoading
	const hasDisplayableData =
		(careerServiceEvents.length > 0 && careerServiceEvents[0] != null) ||
		(studentAdvisoryEvents.length > 0 && studentAdvisoryEvents[0] != null)

	return (
		<BaseCard title="career" onPressRoute="/career-events">
			{isLoading ? (
				<LoadingIndicator />
			) : hasDisplayableData ? (
				<View style={styles.eventsContainer}>
					{careerServiceEvents[0] && (
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
					)}
					{studentAdvisoryEvents[0] && (
						<EventItem
							title={studentAdvisoryEvents[0].title}
							subtitle={t('pages.events.studentAdvisory.title')}
							startDateTime={
								studentAdvisoryEvents[0].date
									? new Date(studentAdvisoryEvents[0].date)
									: undefined
							}
							subtitleTranslationKey="pages.events.studentAdvisory.title"
							color={theme.colors.primary}
						/>
					)}
				</View>
			) : (
				<Text style={styles.noEvents}>{t('error.noData')}</Text>
			)}
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	eventsContainer: {
		gap: 12
	},
	noEvents: {
		color: theme.colors.text,
		textAlign: 'center'
	}
}))

export default CareerCard
