import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'
import NeulandAPI from '@/api/neuland-api'
import { appVersion } from '@/data/app-version'

export const MAP_OVERLAY_QUERY_KEY = ['mapOverlay', appVersion] as const

export function useMapOverlayQuery() {
	return useQuery<FeatureCollection>({
		queryKey: MAP_OVERLAY_QUERY_KEY,
		queryFn: async () => await NeulandAPI.getMapOverlay(),
		staleTime: 1000 * 60 * 60 * 24 * 7,
		gcTime: 1000 * 60 * 60 * 24 * 60,
		networkMode: 'always'
	})
}
