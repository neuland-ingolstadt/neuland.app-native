import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { useContext, useMemo } from 'react'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useRueWarningStore } from '@/hooks/useRueWarningStore'
import { getPersonalData } from '@/utils/api-utils'
import { getNextReRegistrationEvent } from '@/utils/calendar-utils'
import RueWarningBanner from './rue-warning-banner'

const RueWarningBannerContainer: React.FC = () => {
	const { userKind = USER_GUEST } = useContext(UserKindContext)
	const dismissedEventId = useRueWarningStore((state) => state.dismissedEventId)
	const nextRueEvent = useMemo(() => getNextReRegistrationEvent(), [])
	const { data: personalData } = useQuery({
		queryKey: ['personalData'],
		queryFn: getPersonalData,
		staleTime: 1000 * 60 * 60 * 12,
		gcTime: 1000 * 60 * 60 * 24 * 60,
		enabled: userKind === USER_STUDENT
	})

	const showRueWarning =
		userKind === USER_STUDENT &&
		personalData?.mtknr !== undefined &&
		personalData?.rue === '0' &&
		nextRueEvent != null &&
		dismissedEventId !== nextRueEvent.id

	if (!showRueWarning || !nextRueEvent) return null

	return <RueWarningBanner eventId={nextRueEvent.id} />
}

export default RueWarningBannerContainer
