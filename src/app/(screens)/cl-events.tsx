import type React from 'react'
import CampusLifeEventsScreen from '@/components/Events/campus-life-events-screen'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION } from '@/types/campus-life'

export default function ClEventsScreen(): React.JSX.Element {
	return (
		<CampusLifeEventsScreen
			organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION}
			clubsListRoute="/cl-clubs"
			enableSportsTabRedirect
		/>
	)
}
