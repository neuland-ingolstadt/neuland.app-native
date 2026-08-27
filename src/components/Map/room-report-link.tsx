import { router } from 'expo-router'
import type React from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from '../Universal/icon'

interface RoomReportLinkProps {
	roomTitle: string
}

export const RoomReportLink = ({
	roomTitle
}: RoomReportLinkProps): React.JSX.Element => {
	const { t } = useTranslation('common')
	const labelColor = toColor(useCSSVariable('--color-label'))

	const handleReportRoom = useCallback(() => {
		router.navigate({
			pathname: '/room-report',
			params: { room: roomTitle }
		})
	}, [roomTitle])

	return (
		<View className="py-2.5">
			<Pressable
				testID="map-room-report"
				onPress={() => handleReportRoom()}
				className="items-center flex-row gap-1"
			>
				<Text className="text-[15px] ps-1" style={{ color: labelColor }}>
					{t('pages.map.details.room.report')}
				</Text>
				<PlatformIcon
					style={{ color: labelColor }}
					ios={{
						name: 'chevron.forward',
						size: 6
					}}
					android={{
						name: 'chevron_right',
						size: 16
					}}
					web={{
						name: 'ChevronRight',
						size: 16
					}}
				/>
			</Pressable>
		</View>
	)
}
