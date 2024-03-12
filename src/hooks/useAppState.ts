import { useEffect } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

/**
 * Hook to subscribe to app state changes
 * @param onChange Callback function to be called when app state changes
 */
export function useAppState(onChange: (status: AppStateStatus) => void): void {
    useEffect(() => {
        const subscription = AppState.addEventListener('change', onChange)
        return () => {
            subscription.remove()
        }
    }, [onChange])
}
