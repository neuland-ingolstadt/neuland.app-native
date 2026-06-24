import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import { FreeRoomsList } from '@/components/Map/free-rooms-list'
import { roomSearchStylesheet } from '@/components/Map/room-search-styles'
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
	const { styles } = useStyles(roomSearchStylesheet)
	const { t } = useTranslation('common')

	return (
		<>
			<Text style={styles.sectionHeader}>{t('pages.rooms.results')}</Text>
			<View style={styles.sectionContainer}>
				<View style={styles.section}>
					{isLoading ? (
						<LoadingIndicator style={styles.loadingIndicator} />
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
