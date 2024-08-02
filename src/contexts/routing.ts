import { useState } from 'react'

export interface RouteParams {
    routeParams: string
    updateRouteParams: (params: string) => void
}

/**
 * Custom hook that manages the route parameters of the app.
 * @returns RouteParamsHook object with routeParams and updateRouteParams properties.
 */
export function useRouteParams(): RouteParams {
    const [routeParams, updateRouteParams] = useState<string>('')

    return {
        routeParams,
        updateRouteParams,
    }
}
