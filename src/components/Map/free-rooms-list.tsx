import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import type { AvailableRoom } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'

import Divider from '../Universal/Divider'

interface FreeRoomsListProps {
	rooms: AvailableRoom[] | null
}

export const FreeRoomsList = ({
	rooms
}: FreeRoomsListProps): React.JSX.Element => {
	const router = useRouter()
	const { t } = useTranslation('common')

	return rooms !== null && rooms.length > 0 ? (
		<View>
			{rooms.map((room, index) => (
				<View key={index}>
					<View className="items-center flex-row gap-[15px] justify-between px-4 py-[9px]">
						<View>
							<Pressable
								onPress={() => {
									router.dismissTo({
										pathname: '/(tabs)/map',
										params: { room: room.room }
									})
								}}
							>
								<Text className="text-primary text-base font-medium">
									{room.room}
								</Text>
							</Pressable>
							<Text className="text-label text-[13px]" numberOfLines={1}>
								{`${t(`roomTypes.${room.type}`, {
									defaultValue: room.type,
									ns: 'api',
									fallbackLng: 'de'
								})} (${room.capacity} ${t('pages.rooms.options.seats')})`}
							</Text>
						</View>

						<Text className="text-text text-[15px]" numberOfLines={2}>
							{formatFriendlyTime(room.from)} - {formatFriendlyTime(room.until)}
						</Text>
					</View>

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
