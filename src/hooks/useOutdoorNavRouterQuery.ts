import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'
import NeulandAPI from '@/api/neuland-api'
import { appVersion } from '@/data/app-version'
import {
	buildOutdoorRouter,
	type OutdoorRouter
} from '@/utils/indoor-nav/campus-route'

/** Bust persisted cache that stored a non-serializable router object. */
const OUTDOOR_NAV_ROUTER_REVISION = 'footpaths-only-v1'

export const OUTDOOR_NAV_ROUTER_QUERY_KEY = [
	'outdoorNavRouter',
	appVersion,
	OUTDOOR_NAV_ROUTER_REVISION
] as const

export interface OutdoorNavRouterData {
	footpaths: FeatureCollection
	router: OutdoorRouter | null
}

export function useOutdoorNavRouterQuery(enabled: boolean) {
	return useQuery({
		queryKey: OUTDOOR_NAV_ROUTER_QUERY_KEY,
		queryFn: async (): Promise<FeatureCollection> => {
			return await NeulandAPI.getIndoorFootpaths()
		},
		/** Router has methods — rebuild whenever footpaths are read (incl. after MMKV rehydrate). */
		select: (footpaths): OutdoorNavRouterData => ({
			footpaths,
			router: buildOutdoorRouter(footpaths)
		}),
		staleTime: 1000 * 60 * 60 * 12,
		gcTime: 1000 * 60 * 60 * 24 * 60,
		networkMode: 'always',
		enabled
	})
}
