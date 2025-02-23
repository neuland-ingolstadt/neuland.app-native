import { AllCards, type Card } from '@/components/all-cards'
import { USER_GUEST } from '@/data/constants'
import { useCallback, useMemo } from 'react'
import { useMMKVObject } from 'react-native-mmkv'

import { useUserKind } from './userKind'

interface DashboardOrder {
    shown: string[]
    hidden: string[]
    unavailable: string[]
}

export function getDefaultDashboardOrder(
    userKind: string | undefined
): DashboardOrder {
    const userRole = userKind ?? USER_GUEST

    const shown: string[] = [] // default visible cards
    const hidden: string[] = [] // default hidden cards
    const unavailable: string[] = [] // cards that are not available for the user and not secret

    for (const card of AllCards) {
        if (card.allowed.includes(userRole)) {
            if (card.initial.includes(userRole)) {
                shown.push(card.key)
            } else {
                hidden.push(card.key)
            }
        } else if (card.stillVisible ?? true) {
            unavailable.push(card.key)
        }
    }

    return { shown, hidden, unavailable }
}

export interface Dashboard {
    shownDashboardEntries: Card[]
    hiddenDashboardEntries: Card[]
    hiddenAnnouncements: string[]
    hideAnnouncement: (id: string) => void
    hideDashboardEntry: (key: string) => void
    bringBackDashboardEntry: (key: string) => void
    resetOrder: (userKind: string) => void
    updateDashboardOrder: (shown: string[]) => void
}

export function useDashboard(): Dashboard {
    const [shownDashboardEntries, setShownDashboardEntries] = useMMKVObject<
        string[]
    >('shownDashboardEnetsriesV4')
    const [hiddenDashboardEntries, setHiddenDashboardEntries] = useMMKVObject<
        string[]
    >('hiddenDashboardEnetsriesV4')
    const [hiddenAnnouncements, setHiddenAnnouncements] = useMMKVObject<
        string[]
    >('hiddenAnnouncements')
    const { userKind = USER_GUEST } = useUserKind()

    const defaultEntries = useMemo(
        () => getDefaultDashboardOrder(userKind),
        [userKind]
    )

    const entries = useMemo(
        () =>
            (shownDashboardEntries ?? defaultEntries.shown).reduce<Card[]>(
                (acc, key) => {
                    const card = AllCards.find((y) => y.key === key)
                    if (card != null) acc.push(card)
                    return acc
                },
                []
            ),
        [shownDashboardEntries, defaultEntries.shown]
    )

    const hiddenEntries = useMemo(
        () =>
            (hiddenDashboardEntries ?? defaultEntries.hidden).reduce<Card[]>(
                (acc, key) => {
                    const card = AllCards.find((y) => y.key === key)
                    if (card != null) acc.push(card)
                    return acc
                },
                []
            ),
        [hiddenDashboardEntries, defaultEntries.hidden]
    )

    const changeDashboardOrder = useCallback(
        (entries: string[], hiddenEntries: string[]) => {
            setShownDashboardEntries(entries)
            setHiddenDashboardEntries(hiddenEntries)
        },
        [setShownDashboardEntries, setHiddenDashboardEntries]
    )

    const updateDashboardOrder = useCallback(
        (entries: string[]) => {
            setShownDashboardEntries(entries)
        },
        [setShownDashboardEntries]
    )

    const hideDashboardEntry = useCallback(
        (key: string) => {
            const foodKeys = ['mensa', 'mensaNeuburg', 'canisius', 'reimanns']
            const card = foodKeys.includes(key) ? 'food' : key
            setShownDashboardEntries((prevEntries) => {
                const entries = [...(prevEntries ?? defaultEntries.shown)]
                const hiddenEntries = [...(hiddenDashboardEntries ?? [])]

                const index = entries.findIndex((x) => x === card)
                if (index >= 0) {
                    const hiddenCard = entries[index]
                    hiddenEntries.push(hiddenCard)
                    entries.splice(index, 1)
                }

                changeDashboardOrder(entries, hiddenEntries)
                return entries
            })
        },
        [defaultEntries.shown, hiddenDashboardEntries, changeDashboardOrder]
    )

    const hideAnnouncement = useCallback(
        (id: string) => {
            setHiddenAnnouncements((prev) => {
                const newHiddenAnnouncements = new Set(prev ?? [])
                newHiddenAnnouncements.add(id)
                return Array.from(newHiddenAnnouncements)
            })
        },
        [setHiddenAnnouncements]
    )

    const bringBackDashboardEntry = useCallback(
        (key: string) => {
            setShownDashboardEntries((prevEntries) => {
                // using defaultEntries if the user has not configured the dashboard yet
                const entries = [...(prevEntries ?? defaultEntries.shown)]
                const hiddenEntries = [
                    ...(hiddenDashboardEntries ?? defaultEntries.hidden),
                ]

                const index = hiddenEntries.findIndex(
                    (x) => x !== undefined && x === key
                )
                if (index >= 0) {
                    const shownCard = hiddenEntries[index]
                    entries.push(shownCard)
                    hiddenEntries.splice(index, 1)
                }
                changeDashboardOrder(entries, hiddenEntries)
                return entries
            })
        },
        [hiddenDashboardEntries, changeDashboardOrder]
    )

    const resetOrder = useCallback(
        (userKind: string) => {
            const defaultEntries = getDefaultDashboardOrder(userKind)
            if (defaultEntries.shown == null) {
                throw new Error('defaultEntries.shown is null')
            }
            changeDashboardOrder(defaultEntries.shown, defaultEntries.hidden)
        },
        [changeDashboardOrder]
    )

    return {
        shownDashboardEntries: entries,
        hiddenDashboardEntries: hiddenEntries,
        hideDashboardEntry,
        bringBackDashboardEntry,
        resetOrder,
        updateDashboardOrder,
        hiddenAnnouncements: hiddenAnnouncements ?? [],
        hideAnnouncement,
    }
}
