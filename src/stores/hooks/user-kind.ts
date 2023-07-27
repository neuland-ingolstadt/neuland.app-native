import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

// Constants for user types
export const USER_STUDENT = 'student'
export const USER_EMPLOYEE = 'employee'
export const USER_GUEST = 'guest'

/**
 * Custom hook that returns the user kind and a function to toggle it.
 * The user kind is stored in AsyncStorage and defaults to USER_GUEST.
 * @returns An object with the userKind and toggleUserKind function.
 */
export function useUserKind(): {
    userKind: string
    toggleUserKind: (userKind: boolean) => void
} {
    const [userKind, setUserKind] = useState(USER_GUEST)

    // Load user kind from AsyncStorage on mount
    useEffect(() => {
        void AsyncStorage.getItem('isStudent').then((data) => {
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
        void AsyncStorage.setItem('isStudent', userType)
    }

    return {
        userKind,
        toggleUserKind,
    }
}
