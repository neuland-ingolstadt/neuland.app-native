import { trackEvent } from '@aptabase/react-native'
import { router } from 'expo-router'
import type { FeatureCollection, Position } from 'geojson'
import React, { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
import { SEARCH_TYPES } from '@/types/map'
import { formatFriendlyTime } from '@/utils/date-utils'
import { ROOMS_ALL } from '@/utils/map-utils'
import { getContrastColor, roomNotFoundToast } from '@/utils/ui-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import { UserKindContext } from '../contexts'
import Divider from '../Universal/divider'
import PlatformIcon from '../Universal/icon'
import LoadingIndicator from '../Universal/loading-indicator'

interface AvailableRoomsSuggestionsProps {
	allRooms: FeatureCollection
	handlePresentModalPress: () => void
}

const AvailableRoomsSuggestions = ({
	allRooms,
	handlePresentModalPress
}: AvailableRoomsSuggestionsProps): React.JSX.Element => {
	const { t } = useTranslation('common')
	const { userKind = USER_GUEST } = use(UserKindContext)
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const notificationColor = String(
		toColor(useCSSVariable('--color-notification')) ?? '#ff3b30'
	)
	const contrastOnPrimary = getContrastColor(primaryColor)
	const { setClickedElement, availableRooms, setCurrentFloor } = use(MapContext)

	return (
		<View>
			<View className="items-end flex-row justify-between mb-1">
				<Text className="text-text text-xl font-semibold mb-0.5 pt-2 text-left">
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
				className="bg-card rounded-[18px] overflow-hidden"
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
								<View className="flex-row px-3 py-[18px]">
									<View className="items-center flex-row flex-1 justify-between">
										<View
											className="items-center rounded-full h-10 justify-center me-3.5 w-10"
											style={{ backgroundColor: primaryColor }}
										>
											<PlatformIcon
												ios={{
													name: 'studentdesk',
													size: 18
												}}
												android={{
													name: 'school',
													size: 20
												}}
												web={{
													name: 'Notebook',
													size: 20
												}}
												style={{ color: contrastOnPrimary }}
											/>
										</View>

										<View className="flex-1 pe-3.5">
											<Text className="text-text text-base font-semibold mb-px">
												{t('pages.map.allRoomsAvailable.title')}
											</Text>
											<Text className="text-text text-sm font-normal">
												{t('pages.map.allRoomsAvailable.subtitle')}
											</Text>
										</View>
									</View>
								</View>
							)
						}
						return roomSuggestions.map((room, key) => (
							<React.Fragment key={key}>
								<Pressable
									className="flex-row px-3 py-[18px]"
									onPress={() => {
										const details = allRooms.features.find(
											(x) => x.properties?.Raum === room.room
										)

										if (details == null) {
											roomNotFoundToast(room.room, notificationColor)
											return
										}

										const etage = details?.properties?.Ebene as
											| string
											| undefined

										setCurrentFloor({
											floor: etage ?? 'EG',
											manual: false
										})
										setClickedElement({
											data: room.room,
											type: SEARCH_TYPES.ROOM,
											center: details?.properties?.center as
												| Position
												| undefined,
											manual: false
										})
										trackEvent('Room', {
											room: room.room,
											origin: 'AvailableRoomsSuggestion'
										})

										handlePresentModalPress()
									}}
								>
									<View className="items-center flex-row flex-1 justify-between">
										<View
											className="items-center rounded-full h-10 justify-center me-3.5 w-10"
											style={{ backgroundColor: primaryColor }}
										>
											<PlatformIcon
												ios={{
													name: 'studentdesk',
													size: 18
												}}
												android={{
													name: 'school',
													size: 20
												}}
												web={{
													name: 'Notebook',
													size: 20
												}}
												style={{ color: contrastOnPrimary }}
											/>
										</View>

										<View className="flex-1 pe-3.5">
											<Text className="text-text text-base font-semibold mb-px">
												{room.room}
											</Text>
											<Text className="text-text text-sm font-normal">
												{room.type}
												{room.capacity !== undefined && (
													<>
														{' '}
														({room.capacity} {t('pages.rooms.options.seats')})
													</>
												)}
											</Text>
										</View>
									</View>
									<View className="flex-col justify-center">
										<Text
											className="text-label"
											style={{ fontVariant: ['tabular-nums'] }}
										>
											{formatFriendlyTime(room.from)}
										</Text>
										<Text
											className="text-text"
											style={{ fontVariant: ['tabular-nums'] }}
										>
											{formatFriendlyTime(room.until)}
										</Text>
									</View>
								</Pressable>
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
