type NeulandApiClient = typeof import('@/api/neuland-api').default

let indoorNavAssetMethods: Pick<
	NeulandApiClient,
	| 'getMapOverlay'
	| 'getIndoorDoors'
	| 'getIndoorEntrances'
	| 'getIndoorCorridors'
> | null = null

function indoorNavMethodsFromApi() {
	if (indoorNavAssetMethods != null) {
		return indoorNavAssetMethods
	}
	const NeulandAPI = require('@/api/neuland-api').default as NeulandApiClient
	indoorNavAssetMethods = {
		getMapOverlay: NeulandAPI.getMapOverlay.bind(NeulandAPI),
		getIndoorDoors: NeulandAPI.getIndoorDoors.bind(NeulandAPI),
		getIndoorEntrances: NeulandAPI.getIndoorEntrances.bind(NeulandAPI),
		getIndoorCorridors: NeulandAPI.getIndoorCorridors.bind(NeulandAPI)
	}
	return indoorNavAssetMethods
}

/** Partial Neuland API mock that keeps indoor-nav asset fetches working. */
export function neulandApiMockModule(overrides: Record<string, unknown>) {
	return {
		default: {
			...indoorNavMethodsFromApi(),
			...overrides
		}
	}
}
