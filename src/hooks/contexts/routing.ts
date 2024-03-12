import { type FriendlyTimetableEntry } from '@/types/utils'
import { useState } from 'react'

export interface RouteParams {
    routeParams: string
    updateRouteParams: (params: string) => void
    lecture: FriendlyTimetableEntry | null
    updateLecture: (lecture: FriendlyTimetableEntry) => void
}

/**
 * Custom hook that manages the route parameters of the app.
 * @returns RouteParamsHook object with routeParams and updateRouteParams properties.
 */
export function useRouteParams(): RouteParams {
    const [routeParams, updateRouteParams] = useState<string>('')
    const [lecture, updateLecture] = useState<FriendlyTimetableEntry | null>(
        null
    )

    return {
        routeParams,
        updateRouteParams,
        lecture,
        updateLecture,
    }
}
