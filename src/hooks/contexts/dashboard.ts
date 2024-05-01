import { AllCards, type Card } from '@/components/allCards'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

import { useUserKind } from './userKind'

/**
 * Returns an object containing two arrays of Card objects, one for the cards that should be shown by default and one for the hidden cards.
 * @param userKind - A string representing the user type.
 * @returns An object containing two arrays of Card objects, one for the cards that should be shown by default and one for the hidden cards.
 */
export function getDefaultDashboardOrder(userKind: string): {
    shown: Card[] | null // null is used to identify the loading state to hide splash screen
    hidden: Card[]
} {
    const filter = (x: Card): boolean => x.default.includes(userKind)
    return {
        shown: AllCards.filter(filter),
        hidden: AllCards.filter((x) => !filter(x)),
    }
}

export interface Dashboard {
    shownDashboardEntries: Card[] | null
    hiddenDashboardEntries: Card[]
    hiddenAnnouncements: string[]
    hideAnnouncement: (id: string) => void
    hideDashboardEntry: (key: string) => void
    bringBackDashboardEntry: (key: string) => void
    resetOrder: (userKind: string) => void
    updateDashboardOrder: (shown: Card[]) => void
}

export function useDashboard(): Dashboard {
    const [shownDashboardEntries, setShownDashboardEntries] = useState<
        Card[] | null
    >(null)
    const [hiddenDashboardEntries, setHiddenDashboardEntries] = useState<
        Card[]
    >([])
    const [hiddenAnnouncements, setHiddenAnnouncements] = useState<string[]>([])
    const { userKind } = useUserKind()

    useEffect(() => {
        async function load(): Promise<void> {
            const [
                personalDashboard,
                personalDashboardHidden,
                hiddenAnnouncements,
            ] = await Promise.all([
                AsyncStorage.getItem('personalDashboard'),
                AsyncStorage.getItem('personalDashboardHidden'),
                AsyncStorage.getItem('hiddenAnnouncements'),
            ])
            if (hiddenAnnouncements != null) {
                setHiddenAnnouncements(
                    JSON.parse(hiddenAnnouncements) as string[]
                )
            }
            if (personalDashboard != null) {
                const entries = JSON.parse(personalDashboard)
                    .map((x: string) => AllCards.find((y) => y.key === x))
                    .filter((x: Record<string, Card>) => x != null) as Card[]
                setShownDashboardEntries(entries)

                if (personalDashboardHidden != null) {
                    const hiddenEntries = JSON.parse(
                        personalDashboardHidden
                    ).map((x: string) =>
                        AllCards.find((y) => y.key === x)
                    ) as Card[]

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
        setShownDashboardEntries(entries)
    }

    function hideDashboardEntry(key: string): void {
        const foodKeys = ['mensa', 'mensaNeuburg', 'canisius', 'reimanns']
        const card = foodKeys.includes(key) ? 'food' : key
        setShownDashboardEntries((prevEntries) => {
            if (prevEntries == null) {
                throw new Error('prevEntries is null')
            }
            const entries = [...prevEntries]
            const hiddenEntries = [...hiddenDashboardEntries]

            const index = entries.findIndex((x) => x.key === card)
            if (index >= 0) {
                const hiddenCard = entries[index]
                hiddenEntries.push(hiddenCard)
                entries.splice(index, 1)
            }

            changeDashboardOrder(entries, hiddenEntries)
            return entries
        })
    }

    function hideAnnouncement(id: string): void {
        setHiddenAnnouncements((prev) => {
            const newHiddenAnnouncements = [...prev]
            newHiddenAnnouncements.push(id)
            void AsyncStorage.setItem(
                'hiddenAnnouncements',
                JSON.stringify(newHiddenAnnouncements)
            )
            return newHiddenAnnouncements
        })
    }

    function bringBackDashboardEntry(key: string): void {
        setShownDashboardEntries((prevEntries) => {
            if (prevEntries == null) {
                throw new Error('prevEntries is null')
            }
            const entries = [...prevEntries]
            const hiddenEntries = [...hiddenDashboardEntries]

            const index = hiddenEntries.findIndex(
                (x) => x !== undefined && x.key === key
            )
            if (index >= 0) {
                const shownCard = hiddenEntries[index]
                entries.push(shownCard)
                hiddenEntries.splice(index, 1)
            }

            changeDashboardOrder(entries, hiddenEntries)
            return entries // Return the updated entries array
        })
    }

    function resetOrder(userKind: string): void {
        const defaultEntries = getDefaultDashboardOrder(userKind)
        if (defaultEntries.shown == null) {
            throw new Error('defaultEntries.shown is null')
        }
        changeDashboardOrder(defaultEntries.shown, defaultEntries.hidden)
    }

    return {
        shownDashboardEntries,
        hiddenDashboardEntries,
        hideDashboardEntry,
        bringBackDashboardEntry,
        resetOrder,
        updateDashboardOrder,
        hiddenAnnouncements,
        hideAnnouncement,
    }
}
