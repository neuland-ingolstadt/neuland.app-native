import type { FeatureCollection } from 'geojson'
import { use, useEffect, useMemo, useState } from 'react'
import { EMPTY_MAP_FEATURES } from '@/components/Map/map-config'
import { MapContext } from '@/contexts/map'
import { useMapFootpathsQuery } from '@/hooks/useMapFootpathsQuery'
import { useUserMapCoordinate } from '@/hooks/useUserMapCoordinate'
import type { MapCoordinate } from '@/types/map'
import { SEARCH_TYPES } from '@/types/map'
import { buildFootpathGraph, findFootpathRoute } from '@/utils/footpath-route'
import {
	buildCampusNavigationSteps,
	type CampusNavStep
} from '@/utils/map-navigation-steps'
import {
	buildCampusPathGraph,
	campusPathToFeatureCollection,
	collectFootpathObstacles,
	findCampusPath,
	materializeCampusPathGeometry
} from '@/utils/map-path-utils'

interface UseMapRouteOptions {
	allRooms: FeatureCollection
	mapEntrances: FeatureCollection | undefined
}

export interface UseMapRouteResult {
	routeGeoJSON: FeatureCollection
	navigationSteps: CampusNavStep[]
	routeDistanceMeters: number | undefined
}

/** Prototype route: GPS when available, else next lecture → selected room. */
export function useMapRoute({
	allRooms,
	mapEntrances
}: UseMapRouteOptions): UseMapRouteResult {
	const { clickedElement, nextLecture } = use(MapContext)
	const userCoordinate = useUserMapCoordinate()
	const { data: footpaths } = useMapFootpathsQuery()
	const [routeGeoJSON, setRouteGeoJSON] =
		useState<FeatureCollection>(EMPTY_MAP_FEATURES)
	const [navigationSteps, setNavigationSteps] = useState<CampusNavStep[]>([])
	const [routeDistanceMeters, setRouteDistanceMeters] = useState<
		number | undefined
	>()

	const graph = useMemo(
		() => buildCampusPathGraph(allRooms, mapEntrances),
		[allRooms, mapEntrances]
	)

	const footpathObstacles = useMemo(
		() => collectFootpathObstacles(allRooms),
		[allRooms]
	)

	const footpathGraph = useMemo(
		() => buildFootpathGraph(footpaths, footpathObstacles),
		[footpaths, footpathObstacles]
	)

	const skeletonPath = useMemo(() => {
		if (
			clickedElement == null ||
			clickedElement.type !== SEARCH_TYPES.ROOM ||
			clickedElement.data.length === 0
		) {
			return undefined
		}

		const toRoom = clickedElement.data

		if (userCoordinate != null) {
			const gpsPath = findCampusPath({
				graph,
				fromCoordinate: userCoordinate,
				toRoom
			})
			if (gpsPath != null) {
				return gpsPath
			}
		}

		const fromRoom = nextLecture?.[0]?.rooms?.[0]
		if (fromRoom != null && fromRoom.length > 0 && fromRoom !== toRoom) {
			return findCampusPath({
				graph,
				fromRoom,
				toRoom
			})
		}

		return undefined
	}, [clickedElement, graph, nextLecture, userCoordinate])

	useEffect(() => {
		let cancelled = false

		if (skeletonPath == null) {
			setRouteGeoJSON(EMPTY_MAP_FEATURES)
			setNavigationSteps([])
			setRouteDistanceMeters(undefined)
			return
		}

		// Landmark steps from the indoor/entrance skeleton immediately.
		setNavigationSteps(
			buildCampusNavigationSteps({
				path: skeletonPath,
				graph
			})
		)
		setRouteDistanceMeters(skeletonPath.distanceMeters)
		setRouteGeoJSON(campusPathToFeatureCollection(skeletonPath, graph))

		// Wait for street GeoJSON so we don't finalize routes with missing outdoors.
		if (footpaths == null) {
			return () => {
				cancelled = true
			}
		}

		const outdoorPolylines: MapCoordinate[][] = []

		void materializeCampusPathGeometry(
			skeletonPath,
			graph,
			async (from, to) => {
				const foot = findFootpathRoute(footpathGraph, from, to)
				if (foot != null && foot.coordinates.length >= 2) {
					outdoorPolylines.push(foot.coordinates)
				}
				return foot
			}
		).then((materialized) => {
			if (cancelled) {
				return
			}
			setRouteGeoJSON(campusPathToFeatureCollection(materialized, graph))
			setRouteDistanceMeters(materialized.distanceMeters)
			setNavigationSteps(
				buildCampusNavigationSteps({
					path: skeletonPath,
					graph,
					outdoorPolylines
				})
			)
		})

		return () => {
			cancelled = true
		}
	}, [footpathGraph, footpaths, graph, skeletonPath])

	return {
		routeGeoJSON,
		navigationSteps,
		routeDistanceMeters
	}
}
