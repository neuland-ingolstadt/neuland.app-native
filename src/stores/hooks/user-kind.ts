import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'

// Constants for user types
export const USER_STUDENT = 'student'
export const USER_EMPLOYEE = 'employee'
export const USER_GUEST = 'guest'

/**
 * Custom hook that returns the user kind and a function to toggle it.
 * The user kind is stored in SecureStore and defaults to USER_GUEST.
 * @returns An object with the userKind and toggleUserKind function.
 */
export function useUserKind(): {
    userKind: string
    toggleUserKind: (userKind: boolean) => void
} {
    const [userKind, setUserKind] = useState(USER_GUEST)

    // Load user kind from SecureStore on mount.
    // USing SecureStore instead of AsyncStorage because it is temporary workaround for the session handler.
    useEffect(() => {
        void SecureStore.getItemAsync('userType').then((data) => {
            if (data != null) {
                setUserKind(data)
            }
        })
    }, [])

    /**
     * Function to toggle the user kind.
     * @param value A boolean indicating whether the user is a student (true) or an employee (false).
     */
    function toggleUserKind(value: boolean): void {
        let userType = userKind
        switch (value) {
            case true:
                userType = USER_STUDENT
                break
            case false:
                userType = USER_EMPLOYEE
                break
            default:
                userType = USER_GUEST
                break
        }
        setUserKind(userType)
        void SecureStore.setItemAsync('userType', userType)
    }

    return {
        userKind,
        toggleUserKind,
    }
}
