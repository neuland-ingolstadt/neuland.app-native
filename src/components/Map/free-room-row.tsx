import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import type { AvailableRoom } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'

interface FreeRoomRowProps {
	room: AvailableRoom
}

export const FreeRoomRow = ({ room }: FreeRoomRowProps): React.JSX.Element => {
	const router = useRouter()
	const { t } = useTranslation('common')

	return (
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
	)
}
