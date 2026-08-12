import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Text, View } from 'react-native'
import type { AvailableRoom } from '@/types/utils'
import Divider from '../Universal/divider'
import { FreeRoomRow } from './free-room-row'

interface FreeRoomsListProps {
	rooms: AvailableRoom[] | null
}

export const FreeRoomsList = ({
	rooms
}: FreeRoomsListProps): React.JSX.Element => {
	const { t } = useTranslation('common')

	return rooms !== null && rooms.length > 0 ? (
		<View>
			{rooms.map((room, index) => (
				<View key={`${room.room}-${room.from.getTime()}`}>
					<FreeRoomRow room={room} />

					{index !== rooms.length - 1 ? (
						<Divider paddingLeft={Platform.OS === 'ios' ? 16 : 0} />
					) : null}
				</View>
			))}
		</View>
	) : (
		<View className="gap-[5px] py-5">
			<Text className="text-text text-base font-semibold text-center">
				{t('pages.rooms.noRooms.title')}
			</Text>
			<Text className="text-text text-sm text-center">
				{t('pages.rooms.noRooms.subtitle')}
			</Text>
		</View>
	)
}
