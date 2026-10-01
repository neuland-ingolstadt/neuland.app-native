import type React from 'react'
import CampusLifeOrganizersList from '@/components/Events/campus-life-organizers-list'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT } from '@/types/campus-life'

export default function ThiDepartmentsScreen(): React.JSX.Element {
	return (
		<CampusLifeOrganizersList
			organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT}
			page="thiEvents"
			section="departments"
		/>
	)
}
