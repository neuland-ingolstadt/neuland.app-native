import API from '@/api/authenticated-api'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'

export const USER_STUDENT = 'student'
export const USER_EMPLOYEE = 'employee'
export const USER_GUEST = 'guest'

export interface UserKindContextType {
    userKind: 'guest' | 'student' | 'employee' | undefined
    userFullName: string
    userFaculty: string
    toggleUserKind: (userKind: boolean | undefined) => void
    updateUserFullName: (userName: string) => void
}
/**
 * Custom hook that returns the user kind and a function to toggle it.
 * The user kind is stored in SecureStore and defaults to USER_GUEST.
 * @returns An object with the userKind and toggleUserKind function.
 */
export function useUserKind(): {
    userKind: 'guest' | 'student' | 'employee' | undefined
    userFullName: string
    userFaculty: string
    toggleUserKind: (userKind: boolean | undefined) => void
    updateUserFullName: (userName: string) => void
} {
    const [userKind, setUserKind] = useState<
        'guest' | 'student' | 'employee' | undefined
    >(undefined)
    const [userFaculty, setUserFaculty] = useState('')
    const [userFullName, setUserFullName] = useState('')

    // Load user kind from SecureStore on mount.
    // Using SecureStore instead of AsyncStorage because it is temporary workaround for the session handler.
    useEffect(() => {
        const loadFaculty = async (): Promise<string | null> => {
            return await API.getFaculty()
        }

        const loadUserTypeAndName = async (): Promise<[string | null]> => {
            const [userType, userFullName] = await Promise.all([
                SecureStore.getItemAsync('userType'),
                SecureStore.getItemAsync('userFullName'),
            ])

            if (userType != null) {
                setUserKind(userType as 'student' | 'employee' | 'guest')
            } else {
                setUserKind(USER_GUEST)
            }

            if (userFullName != null) {
                setUserFullName(userFullName)
            }

            return [userType]
        }

        const loadData = async (): Promise<void> => {
            const [userType] = await loadUserTypeAndName()

            if (userType === USER_STUDENT) {
                const userFaculty = await loadFaculty()
                if (userFaculty != null) {
                    setUserFaculty(userFaculty)
                }
            }
        }

        void loadData()
    }, [])

    /**
     * Function to toggle the user kind.
     * @param value A boolean indicating whether the user is a student (true) or an employee (false).
     */
    function toggleUserKind(value: boolean | undefined): void {
        let userType = userKind as 'student' | 'employee' | 'guest' | undefined
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
