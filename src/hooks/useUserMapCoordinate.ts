import type { MapCoordinate } from '@/types/map'

/** Web / tests: no MapLibre location module. Native override supplies GPS. */
export function useUserMapCoordinate(): MapCoordinate | undefined {
	return undefined
}
