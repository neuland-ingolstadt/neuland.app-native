import type { RelativePathString } from 'expo-router'
import type React from 'react'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT } from '@/types/campus-life'

import CampusLifeEventsCard from './campus-life-events-card'

const ThiEventsCard = (): React.JSX.Element => {
	return (
		<CampusLifeEventsCard
			title="thiEvents"
			organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT}
			listRoute={'/thi-events' as RelativePathString}
		/>
	)
}

export default ThiEventsCard
