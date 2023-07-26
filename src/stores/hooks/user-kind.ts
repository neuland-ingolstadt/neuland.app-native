import { useState } from 'react'

export const USER_STUDENT = 'student'
export const USER_EMPLOYEE = 'employee'
export const USER_GUEST = 'guest'

export function useUserKind(): {
    userKind: string
    updateUserKind: (userKind: boolean) => void
} {
    const [userKind, setUserKind] = useState(USER_GUEST)

    function updateUserKind(isStudent: boolean): void {
        switch (isStudent) {
            case true:
                setUserKind(USER_STUDENT)
                break
            case false:
                setUserKind(USER_EMPLOYEE)
                break
            default:
                setUserKind(USER_GUEST)
                break
        }
    }

    return {
        userKind,
        updateUserKind,
    }
}
