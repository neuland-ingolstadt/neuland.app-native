import { useCallback, useEffect, useMemo } from 'react'
import { useMMKVBoolean, useMMKVObject } from 'react-native-mmkv'
import { AllCards, type Card } from '@/components/all-cards'
import { USER_GUEST } from '@/data/constants'

import { useUserKind } from './userKind'

interface DashboardOrder {
	shown: string[]
	unavailable: string[]
}

export function getDefaultDashboardOrder(
	userKind: string | undefined
): DashboardOrder {
	const userRole = userKind ?? USER_GUEST

	const shown: string[] = [] // default visible cards
	const unavailable: string[] = [] // cards that are not available for the user and not secret

	for (const card of AllCards) {
		if (card.allowed.includes(userRole)) {
			if (card.initial.includes(userRole)) {
				shown.push(card.key)
			}
		} else if (card.stillVisible ?? true) {
			unavailable.push(card.key)
		}
	}

	return { shown, unavailable }
}

export interface Dashboard {
	shownDashboardEntries: Card[]
	hiddenAnnouncements: string[]
	hideAnnouncement: (id: string) => void
	resetOrder: (userKind: string) => void
	updateDashboardOrder: (shown: string[]) => void
}

export function useDashboard(): Dashboard {
	const [shownDashboardEntries, setShownDashboardEntries] = useMMKVObject<
		string[]
	>('shownDashboardEntriesV7')
	const [hiddenAnnouncements, setHiddenAnnouncements] = useMMKVObject<string[]>(
		'hiddenAnnouncements'
	)
	const [sportsCardMigrationDone, setSportsCardMigrationDone] = useMMKVBoolean(
		'shownDashboardEntriesSportsMigrationV1'
	)
	const { userKind = USER_GUEST } = useUserKind()

	const defaultEntries = useMemo(
		() => getDefaultDashboardOrder(userKind),
		[userKind]
	)

	useEffect(() => {
		if (sportsCardMigrationDone === true) {
			return
		}

		if (shownDashboardEntries == null) {
			setSportsCardMigrationDone(true)
			return
		}

		const hasEventsCard = shownDashboardEntries.includes('events')
		const hasSportsCard = shownDashboardEntries.includes('sports')

		if (hasEventsCard && !hasSportsCard) {
			const migratedEntries = shownDashboardEntries.filter(
				(key) => key !== 'sports'
			)
			const eventsIndex = migratedEntries.indexOf('events')
			migratedEntries.splice(eventsIndex + 1, 0, 'sports')
			setShownDashboardEntries(migratedEntries)
		}

		setSportsCardMigrationDone(true)
	}, [
		sportsCardMigrationDone,
		shownDashboardEntries,
		setShownDashboardEntries,
		setSportsCardMigrationDone
	])

	const normalizedShownEntries = useMemo(() => {
		const fallback = defaultEntries.shown
		const shownEntries = shownDashboardEntries ?? fallback
		const knownCardKeys = new Set(AllCards.map((card) => card.key))

		return shownEntries.filter((key) => knownCardKeys.has(key))
	}, [shownDashboardEntries, defaultEntries.shown])

	const entries = useMemo(
		() =>
			normalizedShownEntries.reduce<Card[]>((acc, key) => {
				const card = AllCards.find((y) => y.key === key)
				if (card != null) acc.push(card)
				return acc
			}, []),
		[normalizedShownEntries]
	)

	const updateDashboardOrder = useCallback(
		(entries: string[]) => {
			setShownDashboardEntries(entries)
		},
		[setShownDashboardEntries]
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

	const resetOrder = useCallback(
		(userKind: string) => {
			const defaultEntries = getDefaultDashboardOrder(userKind)
			if (defaultEntries.shown == null) {
				throw new Error('defaultEntries.shown is null')
			}
			setShownDashboardEntries(defaultEntries.shown)
		},
		[setShownDashboardEntries]
	)

	return {
		shownDashboardEntries: entries,
		resetOrder,
		updateDashboardOrder,
		hiddenAnnouncements: hiddenAnnouncements ?? [],
		hideAnnouncement
	}
}
