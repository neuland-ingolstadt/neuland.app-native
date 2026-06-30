import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import { FreeRoomsList } from '@/components/Map/free-rooms-list'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import type { AvailableRoom } from '@/types/utils'
import { networkError } from '@/utils/api-utils'

interface RoomSearchResultsProps {
	rooms: AvailableRoom[] | null
	filterError: boolean
	isLoading: boolean
	isError: boolean
	isPaused: boolean
	error: Error | null
	refetchByUser: () => Promise<unknown>
}

export function RoomSearchResults({
	rooms,
	filterError,
	isLoading,
	isError,
	isPaused,
	error,
	refetchByUser
}: RoomSearchResultsProps): React.JSX.Element {
	const { t } = useTranslation('common')

	return (
		<>
			<Text className="text-label-secondary text-[13px] font-normal mb-1 uppercase">
				{t('pages.rooms.results')}
			</Text>
			<View className="pb-5">
				<View className="bg-card rounded-md mb-4">
					{isLoading ? (
						<LoadingIndicator style={{ paddingVertical: 30 }} />
					) : isPaused ? (
						<ErrorView
							title={networkError}
							onButtonPress={() => {
								void refetchByUser()
							}}
							inModal
						/>
					) : isError || filterError ? (
						<ErrorView
							title={error?.message ?? t('error.title')}
							onButtonPress={() => {
								void refetchByUser()
							}}
							inModal
						/>
					) : rooms != null ? (
						<FreeRoomsList rooms={rooms} />
					) : null}
				</View>
			</View>
		</>
	)
}
