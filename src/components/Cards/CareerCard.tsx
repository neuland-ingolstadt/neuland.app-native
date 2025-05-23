import { getFragmentData } from '@/__generated__/gql'
import {
	type CareerServiceEventFieldsFragment,
	CareerServiceEventFieldsFragmentDoc,
	type CareerServiceEventsQuery,
	type StudentAdvisoryEventFieldsFragment,
	StudentAdvisoryEventFieldsFragmentDoc,
	type StudentAdvisoryEventsQuery
} from '@/__generated__/gql/graphql'
import neulandAPI from '@/api/neuland-api'
import { QUERY_KEYS } from '@/utils/events-utils'
import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import EventItem from '../Universal/EventItem'
import BaseCard from './BaseCard'

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
	const careerServiceEvents: CareerServiceEventFieldsFragment[] = (
		Array.isArray(rawCareerEvents)
			? rawCareerEvents.map((event) =>
					getFragmentData(CareerServiceEventFieldsFragmentDoc, event)
				)
			: []
	).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

	const rawStudentAdvisoryEvents =
		studentAdvisoryQuery.data?.studentAdvisoryEvents
	const studentAdvisoryEvents: StudentAdvisoryEventFieldsFragment[] = (
		Array.isArray(rawStudentAdvisoryEvents)
			? rawStudentAdvisoryEvents.map((event) =>
					getFragmentData(StudentAdvisoryEventFieldsFragmentDoc, event)
				)
			: []
	).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

	return (
		<BaseCard title="thiServices" onPressRoute="/thi-services">
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
		</BaseCard>
	)
}

const stylesheet = createStyleSheet(() => ({
	eventsContainer: {
		marginTop: 10,
		gap: 12
	}
}))

export default CareerCard
