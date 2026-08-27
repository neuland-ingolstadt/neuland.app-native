import { router } from 'expo-router'
import type { FeatureCollection } from 'geojson'
import React, { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
import type { SelectMapElement } from '@/types/map'
import { ROOMS_ALL } from '@/utils/map-constants'
import { hairlineBorder } from '@/utils/uniwind-utils'
import { UserKindContext } from '../contexts'
import Divider from '../Universal/divider'
import LoadingIndicator from '../Universal/loading-indicator'
import { AllRoomsAvailable } from './all-rooms-available'
import { AvailableRoomRow } from './available-room-row'

interface AvailableRoomsSuggestionsProps {
	allRooms: FeatureCollection
	selectMapElement: SelectMapElement
}

const AvailableRoomsSuggestions = ({
	allRooms,
	selectMapElement
}: AvailableRoomsSuggestionsProps): React.JSX.Element => {
	const { t } = useTranslation('common')
	const { userKind = USER_GUEST } = use(UserKindContext)
	const { availableRooms } = use(MapContext)

	return (
		<View testID="map-available-rooms">
			<View className="items-end flex-row justify-between mb-1">
				<Text className="text-text text-label-secondary ios:text-base ios:font-semibold android:text-[13px] android:font-normal android:uppercase web:text-base web:font-semibold mb-0.5 pt-2 text-left">
					{t('pages.map.details.room.availableRooms')}
				</Text>
				{userKind !== USER_GUEST && (
					<Pressable
						onPress={() => {
							router.navigate('/room-search')
						}}
						hitSlop={{
							bottom: 10,
							left: 10,
							right: 10,
							top: 10
						}}
						className="shrink"
					>
						<Text className="text-primary text-base font-medium pe-2.5 text-right">
							{t('misc.more')}
						</Text>
					</Pressable>
				)}
			</View>
			<Pressable
				className="bg-card ios:rounded-[18px] android:rounded-lg web:rounded-lg overflow-hidden border-border"
				style={hairlineBorder}
				onPress={() => {
					router.navigate('/login')
				}}
				disabled={userKind !== USER_GUEST}
			>
				{userKind === USER_GUEST ? (
					<Text className="text-text text-base py-[30px] text-center">
						{t('pages.map.details.room.signIn')}
					</Text>
				) : availableRooms === null ? (
					<LoadingIndicator style={{ marginVertical: 30 }} />
				) : availableRooms.length === 0 ? (
					<Text className="text-text text-base py-[30px] text-center">
						{t('pages.map.noAvailableRooms')}
					</Text>
				) : (
					(() => {
						const roomSuggestions = availableRooms.slice(0, 3)
						if (roomSuggestions.at(0)?.room === ROOMS_ALL) {
							return (
								<AllRoomsAvailable
									title={t('pages.map.allRoomsAvailable.title')}
									subtitle={t('pages.map.allRoomsAvailable.subtitle')}
								/>
							)
						}
						return roomSuggestions.map((room, key) => (
							<React.Fragment key={key}>
								<AvailableRoomRow
									room={room}
									allRooms={allRooms}
									selectMapElement={selectMapElement}
								/>
								{roomSuggestions.length > 1 &&
									key < roomSuggestions.length - 1 && <Divider />}
							</React.Fragment>
						))
					})()
				)}
			</Pressable>
		</View>
	)
}

export default AvailableRoomsSuggestions
