import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'
import NeulandAPI from '@/api/neuland-api'
import { appVersion } from '@/data/app-version'

export const MAP_ENTRANCES_QUERY_KEY = ['mapEntrances', appVersion] as const

export function useMapEntrancesQuery() {
	return useQuery<FeatureCollection>({
		queryKey: MAP_ENTRANCES_QUERY_KEY,
		queryFn: async () => await NeulandAPI.getMapEntrances(),
		staleTime: 1000 * 60 * 60 * 12, // 12 hours
		gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
		networkMode: 'always'
	})
}
