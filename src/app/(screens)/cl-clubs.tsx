import type React from 'react'
import CampusLifeOrganizersList from '@/components/Events/campus-life-organizers-list'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION } from '@/types/campus-life'

export default function ClClubsScreen(): React.JSX.Element {
	return (
		<CampusLifeOrganizersList
			organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION}
			page="clEvents"
			section="clubs"
		/>
	)
}
