import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'
import NeulandAPI from '@/api/neuland-api'
import { appVersion } from '@/data/app-version'

export const MAP_FOOTPATHS_QUERY_KEY = ['mapFootpaths', appVersion, 5] as const

export function useMapFootpathsQuery() {
	return useQuery<FeatureCollection>({
		queryKey: MAP_FOOTPATHS_QUERY_KEY,
		queryFn: async () => await NeulandAPI.getMapFootpaths(),
		// Footpath edits ship without an app release — refresh more often than rooms.
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
		networkMode: 'always'
	})
}
