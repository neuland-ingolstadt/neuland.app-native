import { AllCards } from '@/components/allCards'
import {
    type Card,
    type CardDisplayed,
    type CardPersisted,
} from '@customTypes/settings'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

import { useUserKind } from './userKind'

/**
 * Returns an object containing two arrays of Card objects, one for the cards that should be shown by default and one for the hidden cards.
 * @param userKind - A string representing the user type.
 * @returns An object containing two arrays of Card objects, one for the cards that should be shown by default and one for the hidden cards.
 */
function getDefaultDashboardOrder(userKind: string): CardDisplayed[] {
    return AllCards.map(
        (card): CardDisplayed => ({
            ...card,
            isHidden: !card.default.includes(userKind),
        })
    )
}

export interface Dashboard {
    dashboardEntries: CardDisplayed[]
    hideDashboardEntry: (key: string) => void
    bringBackDashboardEntry: (key: string) => void
    resetOrder: () => void
    updateDashboardOrder: (cards: CardDisplayed[]) => void
}

export function useDashboard(): Dashboard {
    const [dashboardEntries, setDashboardEntries] = useState<CardDisplayed[]>(
        []
    )
    const { userKind } = useUserKind()

    useEffect(() => {
        async function load(): Promise<void> {
            const personalDashboard = await AsyncStorage.getItem(
                'dashboardCards'
            )

            if (personalDashboard !== null) {
                const entries = JSON.parse(personalDashboard)
                    .map((x: CardPersisted): CardDisplayed | undefined => {
                        const card = AllCards.find(({ key }) => key === x.key)
                        if (card !== undefined) {
                            return { ...card, isHidden: x.isHidden }
                        }

                        return undefined
                    })
                    .filter((x: Card) => x != null)

                setDashboardEntries(entries)
            } else {
                const entries = getDefaultDashboardOrder(userKind)
                setDashboardEntries(
                    entries.sort((a, b) =>
                        b.isHidden ? 1 : 0 - (a.isHidden ? 1 : 0)
                    )
                )
            }
        }

        void load()
    }, [userKind])

    function updateDashboardOrder(entries: CardDisplayed[]): void {
        // console.log(dashboardEntries.filter(({isHidden}) => !isHidden));
        const cards: CardDisplayed[] = entries.sort((a, b) =>
            b.isHidden ? 1 : 0 - (a.isHidden ? 1 : 0)
        )

        // console.log(cards)

        void AsyncStorage.setItem(
            'dashboardCards',
            JSON.stringify(
                cards.map(
                    ({ key, isHidden }): CardPersisted => ({ key, isHidden })
                )
            )
        )

        setDashboardEntries(cards)
    }

    function hideDashboardEntry(key: string): void {
        console.log(
            key,
            dashboardEntries.filter((x) => x.isHidden)
        )

        const newCards = dashboardEntries.map((card) => ({
            ...card,
            isHidden: card.isHidden || card.key === key,
        }))

        console.log(
            key,
            newCards.filter((x) => x.isHidden)
        )

        updateDashboardOrder(newCards)
    }

    function bringBackDashboardEntry(key: string): void {
        const newCards = dashboardEntries.map((card) => ({
            ...card,
            isHidden: !card.isHidden ? false : !(card.key === key),
        }))

        updateDashboardOrder(newCards)
    }

    function resetOrder(): void {
        updateDashboardOrder(getDefaultDashboardOrder(userKind))
    }

    return {
        dashboardEntries,
        hideDashboardEntry,
        bringBackDashboardEntry,
        resetOrder,
        updateDashboardOrder,
    }
}
