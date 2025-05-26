import { getFragmentData } from '@/__generated__/gql'
import {
	type CareerServiceEventFieldsFragment,
	CareerServiceEventFieldsFragmentDoc,
	type CareerServiceEventsQuery,
	type StudentCounsellingEventFieldsFragment,
	StudentCounsellingEventFieldsFragmentDoc,
	type StudentCounsellingEventsQuery
} from '@/__generated__/gql/graphql'
import neulandAPI from '@/api/neuland-api'
import { QUERY_KEYS } from '@/utils/events-utils'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { Platform } from 'react-native'
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

	const studentCounsellingQuery = useQuery<StudentCounsellingEventsQuery, Error>({
		queryKey: [QUERY_KEYS.STUDENT_ADVISORY_EVENTS],
		queryFn: () => neulandAPI.getStudentCounsellingEvents(),
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

	const rawStudentCounsellingEvents =
		studentCounsellingQuery.data?.studentCounsellingEvents
	const studentCounsellingEvents: StudentCounsellingEventFieldsFragment[] = (
		Array.isArray(rawStudentCounsellingEvents)
			? rawStudentCounsellingEvents.map((event) =>
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

	return (
		<BaseCard title="thiServices" onPressRoute="/thi-services">
			<View style={styles.eventsContainer}>
				{careerServiceEvents[0] && (
					<Pressable
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
				)}
				{studentCounsellingEvents[0] && (
					<Pressable
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
