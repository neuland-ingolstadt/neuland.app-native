import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
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
import EventItem from '../Universal/EventItem'
import BaseCard from './BaseCard'

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
