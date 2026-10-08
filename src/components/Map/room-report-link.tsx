import { router } from 'expo-router'
import type React from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { MapChevronLink } from '@/components/Map/map-chevron-link'

interface RoomReportLinkProps {
	roomTitle: string
}

export const RoomReportLink = ({
	roomTitle
}: RoomReportLinkProps): React.JSX.Element => {
	const { t } = useTranslation('common')

	const handleReportRoom = useCallback(() => {
		router.navigate({
			pathname: '/room-report',
			params: { room: roomTitle }
		})
	}, [roomTitle])

	return (
		<MapChevronLink
			label={t('pages.map.details.room.report')}
			testID="map-room-report"
			onPress={handleReportRoom}
		/>
	)
}
