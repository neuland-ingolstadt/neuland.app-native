import type React from 'react'
import CampusLifeEventsScreen from '@/components/Events/campus-life-events-screen'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT } from '@/types/campus-life'

export default function ThiEventsScreen(): React.JSX.Element {
	return (
		<CampusLifeEventsScreen
			organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT}
			clubsListRoute="/thi-departments"
		/>
	)
}
