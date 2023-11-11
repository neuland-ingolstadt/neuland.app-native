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
    const [routeParams, setRouteParams] = useState<string>('')

    /**
     * Function to update the route parameters of the app.
     * @param params - The new route parameters.
     */
    function updateRouteParams(params: string): void {
        setRouteParams(params)
    }

    return {
        routeParams,
        updateRouteParams,
    }
}
