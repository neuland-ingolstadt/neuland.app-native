import API from '@/api/authenticated-api'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'

export const USER_UNKNOWN = 'unknown'
export const USER_STUDENT = 'student'
export const USER_EMPLOYEE = 'employee'
export const USER_GUEST = 'guest'

export interface UserKindContextType {
    userKind: 'guest' | 'student' | 'employee'
    userFullName: string
    userFaculty: string
    toggleUserKind: (userKind: boolean) => void
    updateUserFullName: (userName: string) => void
}
/**
 * Custom hook that returns the user kind and a function to toggle it.
 * The user kind is stored in SecureStore and defaults to USER_GUEST.
 * @returns An object with the userKind and toggleUserKind function.
 */
export function useUserKind(): {
    userKind: string
    userFullName: string
    userFaculty: string
    toggleUserKind: (userKind: boolean) => void
    updateUserFullName: (userName: string) => void
} {
    const [userKind, setUserKind] = useState(USER_GUEST)
    const [userFaculty, setUserFaculty] = useState('')
    const [userFullName, setUserFullName] = useState('')

    // Load user kind from SecureStore on mount.
    // Using SecureStore instead of AsyncStorage because it is temporary workaround for the session handler.
    useEffect(() => {
        const loadFaculty = async (): Promise<string> => {
            return (await API.getFaculty()) as string
        }

        const loadData = async (): Promise<void> => {
            const userType = await SecureStore.getItemAsync('userType')
            const userFullName = await SecureStore.getItemAsync('userFullName')
            if (userType != null) {
                setUserKind(userType)
            }

            if (userType === USER_STUDENT) {
                const userFaculty = await loadFaculty()
                if (userFaculty != null) {
                    setUserFaculty(userFaculty)
                }
            }

            if (userFullName != null) {
                setUserFullName(userFullName)
            }
        }

        void loadData()
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

    function updateUserFullName(value: string): void {
        setUserFullName(value)
        void SecureStore.setItemAsync('userFullName', value)
    }

    return {
        userKind,
        userFullName,
        userFaculty,
        toggleUserKind,
        updateUserFullName,
    }
}
