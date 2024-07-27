import {
    extractFacultyFromPersonalData,
    getPersonalData,
} from '@/utils/api-utils'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/utils/app-utils'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { useMMKVString } from 'react-native-mmkv'

export interface UserKindContextType {
    userKind: 'guest' | 'student' | 'employee' | undefined
    userFullName: string
    userFaculty: string | undefined
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
    userFaculty: string | undefined
    toggleUserKind: (userKind: boolean | undefined) => void
    updateUserFullName: (userName: string) => void
} {
    const [userKind, setUserKind] = useMMKVString('userType') as [
        'student' | 'employee' | 'guest' | undefined,
        (value: 'student' | 'employee' | 'guest' | undefined) => void,
    ]
    const [userFaculty, setUserFaculty] = useMMKVString('userFaculty')
    const [userFullName, setUserFullName] = useState('')

    useEffect(() => {
        const loadData = async (): Promise<void> => {
            // loads the user type from the SecureStore. Can be removed in future versions.
            if (userKind === undefined) {
                const storedUserType =
                    await SecureStore.getItemAsync('userType')
                if (storedUserType != null) {
                    await SecureStore.deleteItemAsync('userType')
                    setUserKind(
                        storedUserType as 'student' | 'employee' | 'guest'
                    )
                } else {
                    setUserKind(USER_GUEST)
                }
            }

            const userFullName = await SecureStore.getItemAsync('userFullName')
            if (userFullName != null) {
                setUserFullName(userFullName)
            }
        }

        void loadData()
    }, [])

    useEffect(() => {
        const loadData = async (): Promise<void> => {
            if (userFaculty === undefined && userKind === USER_STUDENT) {
                const persData = await getPersonalData()
                const faculty = extractFacultyFromPersonalData(persData)
                if (faculty !== null) {
                    setUserFaculty(faculty)
                } else {
                    setUserFaculty(undefined)
                }
            }
        }
        void loadData()
    }, [userKind])

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
