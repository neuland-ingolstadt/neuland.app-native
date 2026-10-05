import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'
import NeulandAPI from '@/api/neuland-api'
import { appVersion } from '@/data/app-version'
import {
	MAP_OVERLAY_QUERY_KEY,
	useMapOverlayQuery
} from '@/hooks/useMapOverlayQuery'
import {
	applyIndoorData,
	loadIndoorDataFromAssets
} from '@/utils/indoor-nav/data'
import type { IndoorData } from '@/utils/indoor-nav/types'

export const INDOOR_NAV_DATA_QUERY_KEY = ['indoorNavData', appVersion] as const

export function useIndoorNavDataQuery(enabled: boolean) {
	const queryClient = useQueryClient()
	const { data: mapOverlay } = useMapOverlayQuery()

	return useQuery({
		queryKey: INDOOR_NAV_DATA_QUERY_KEY,
		queryFn: async () => {
			const rooms =
				mapOverlay ??
				queryClient.getQueryData<FeatureCollection>(MAP_OVERLAY_QUERY_KEY) ??
				(await NeulandAPI.getMapOverlay())
			return await loadIndoorDataFromAssets(rooms)
		},
		staleTime: 1000 * 60 * 60 * 12,
		gcTime: 1000 * 60 * 60 * 24 * 60,
		networkMode: 'always',
		enabled,
		/** Keep module cache in sync when React Query serves persisted data (no queryFn). */
		select: (data: IndoorData) => {
			applyIndoorData(data)
			return data
		}
	})
}
