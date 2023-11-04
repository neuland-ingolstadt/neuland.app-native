import { AllCards, type Card } from '@/components/allCards'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

import { useUserKind } from './userKind'

/**
 * Returns an object containing two arrays of Card objects, one for the cards that should be shown by default and one for the hidden cards.
 * @param userKind - A string representing the user type.
 * @returns An object containing two arrays of Card objects, one for the cards that should be shown by default and one for the hidden cards.
 */
function getDefaultDashboardOrder(userKind: string): {
    shown: Card[]
    hidden: Card[]
} {
    const filter = (x: Card): boolean => x.default.includes(userKind)
    return {
        shown: AllCards.filter(filter),
        hidden: AllCards.filter((x) => !filter(x)),
    }
}

export interface Dashboard {
    shownDashboardEntries: Card[]
    hiddenDashboardEntries: Card[]
    hideDashboardEntry: (key: string) => void
    bringBackDashboardEntry: (key: string) => void
    resetOrder: () => void
    updateDashboardOrder: (shown: Card[]) => void
}

export function useDashboard(): Dashboard {
    const [shownDashboardEntries, setShownDashboardEntries] = useState<Card[]>(
        []
    )
    const [hiddenDashboardEntries, setHiddenDashboardEntries] = useState<
        Card[]
    >([])
    const { userKind } = useUserKind()

    useEffect(() => {
        async function load(): Promise<void> {
            const personalDashboard = await AsyncStorage.getItem(
                'personalDashboard'
            )
            const personalDashboardHidden = await AsyncStorage.getItem(
                'personalDashboardHidden'
            )
            if (personalDashboard != null) {
                const entries = JSON.parse(personalDashboard)
                    .map((x: string) => AllCards.find((y) => y.key === x))
                    .filter((x: Record<string, Card>) => x != null)
                setShownDashboardEntries(entries)

                if (personalDashboardHidden != null) {
                    const hiddenEntries = JSON.parse(
                        personalDashboardHidden
                    ).map((x: string) => AllCards.find((y) => y.key === x))

                    setHiddenDashboardEntries(hiddenEntries)
                }
            } else {
                const entries = getDefaultDashboardOrder(userKind)
                setShownDashboardEntries(entries.shown)
                setHiddenDashboardEntries(entries.hidden)
            }
        }

        void load()
    }, [userKind])

    function changeDashboardOrder(
        entries: Card[],
        hiddenEntries: Card[]
    ): void {
        void AsyncStorage.setItem(
            'personalDashboard',
            JSON.stringify(entries.map((x) => x.key))
        )
        void AsyncStorage.setItem(
            'personalDashboardHidden',
            JSON.stringify(hiddenEntries.map((x) => x.key))
        )
        setShownDashboardEntries(entries)
        setHiddenDashboardEntries(hiddenEntries)
    }

    function updateDashboardOrder(entries: Card[]): void {
        void AsyncStorage.setItem(
            'personalDashboard',
            JSON.stringify(entries.map((x) => x.key))
        )
        console.log(entries)
        setShownDashboardEntries(entries)
    }

    function hideDashboardEntry(key: string): void {
        setShownDashboardEntries((prevEntries) => {
            const entries = [...prevEntries]
            const hiddenEntries = [...hiddenDashboardEntries]

            const index = entries.findIndex((x) => x.key === key)
            if (index >= 0) {
                const hiddenCard = entries[index]
                hiddenEntries.push(hiddenCard)
                entries.splice(index, 1)
            }

            changeDashboardOrder(entries, hiddenEntries)
            return entries
        })
    }

    function bringBackDashboardEntry(key: string): void {
        setShownDashboardEntries((prevEntries) => {
            const entries = [...prevEntries]
            const hiddenEntries = [...hiddenDashboardEntries]

            const index = hiddenEntries.findIndex((x) => x.key === key)
            if (index >= 0) {
                const shownCard = hiddenEntries[index]
                entries.push(shownCard)
                hiddenEntries.splice(index, 1)
            }

            changeDashboardOrder(entries, hiddenEntries)
            return entries // Return the updated entries array
        })
    }

    function resetOrder(): void {
        const defaultEntries = getDefaultDashboardOrder(userKind)
        changeDashboardOrder(defaultEntries.shown, defaultEntries.hidden)
    }

    return {
        shownDashboardEntries,
        hiddenDashboardEntries,
        hideDashboardEntry,
        bringBackDashboardEntry,
        resetOrder,
        updateDashboardOrder,
    }
}
