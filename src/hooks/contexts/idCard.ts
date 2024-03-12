import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface IdCard {
    mensaBalance: number
    idLastUpdated: Date | null
    updateMensaBalance: (balance: number) => void
}

export function useIdCard(): IdCard {
    const [mensaBalance, setMensaBalance] = useState<number>(0)
    const [idLastUpdated, setIdLastUpdated] = useState<Date>(new Date())

    useEffect(() => {
        void Promise.all([
            AsyncStorage.getItem('mensaBalance'),
            AsyncStorage.getItem('idLastUpdated'),
        ]).then(([mensaBalanceData, idLastUpdatedData]) => {
            if (mensaBalanceData != null) {
                setMensaBalance(JSON.parse(mensaBalanceData))
            }
            if (idLastUpdatedData != null) {
                setIdLastUpdated(JSON.parse(idLastUpdatedData))
            }
        })
    }, [])

    /**
     * Updates the id card mensa balance
     * @param {number} balance in euro
     */
    function updateMensaBalance(balance: number): void {
        setMensaBalance(balance)
        setIdLastUpdated(new Date())

        void Promise.all([
            AsyncStorage.setItem('mensaBalance', JSON.stringify(balance)),
            AsyncStorage.setItem('idLastUpdated', JSON.stringify(new Date())),
        ])
    }
    return {
        mensaBalance,
        idLastUpdated,
        updateMensaBalance,
    }
}
