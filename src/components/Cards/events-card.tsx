import type { RelativePathString } from 'expo-router'
import type React from 'react'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION } from '@/types/campus-life'

import CampusLifeEventsCard from './campus-life-events-card'

const EventsCard = (): React.JSX.Element => (
	<CampusLifeEventsCard
		title="events"
		organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION}
		listRoute={'/cl-events' as RelativePathString}
	/>
)

export default EventsCard
