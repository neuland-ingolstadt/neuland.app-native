import { useIsRestoring } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import { useMMKVBoolean, useMMKVObject } from 'react-native-mmkv'
import { AllCards, type Card } from '@/components/all-cards'
import { USER_GUEST } from '@/data/constants'
import type { FeatureFlagState } from '@/lib/feature-flags'
import { arraysEqual } from '@/utils/app-utils'

import { useFeatureFlags } from './feature-flags'
import { useUserKind } from './userKind'

interface DashboardOrder {
	shown: string[]
	unavailable: string[]
}

export function isCardEnabled(
	card: Pick<Card, 'featureFlag'>,
	flags: FeatureFlagState,
	options?: { skipFeatureFlagCheck?: boolean }
): boolean {
	if (card.featureFlag == null || options?.skipFeatureFlagCheck === true) {
		return true
	}

	return flags[card.featureFlag] === true
}

function isCardKeyEnabled(
	cardKey: string,
	flags: FeatureFlagState,
	options?: { skipFeatureFlagCheck?: boolean }
): boolean {
	const card = AllCards.find((entry) => entry.key === cardKey)
	if (card == null) {
		return false
	}

	return isCardEnabled(card, flags, options)
}

export function getDefaultDashboardOrder(
	userKind: string | undefined,
	flags: FeatureFlagState
): DashboardOrder {
	const userRole = userKind ?? USER_GUEST

	const shown: string[] = []
	const unavailable: string[] = []

	for (const card of AllCards) {
		if (!isCardEnabled(card, flags)) {
			continue
		}

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

/**
 * Inserts newly enabled feature-flagged cards into a customized dashboard order.
 * Placement follows {@link AllCards} order relative to cards the user already shows.
 */
export function mergeNewFlaggedCardsIntoDashboard(
	shownEntries: string[],
	userKind: string | undefined,
	flags: FeatureFlagState
): string[] {
	const userRole = userKind ?? USER_GUEST
	let merged = [...shownEntries]

	for (const card of AllCards) {
		if (card.featureFlag == null || !isCardEnabled(card, flags)) {
			continue
		}
		if (!card.allowed.includes(userRole) || !card.initial.includes(userRole)) {
			continue
		}
		if (merged.includes(card.key)) {
			continue
		}

		const cardIndex = AllCards.indexOf(card)
		let insertAt = merged.length

		for (let index = cardIndex - 1; index >= 0; index--) {
			const anchorIndex = merged.indexOf(AllCards[index].key)
			if (anchorIndex !== -1) {
				insertAt = anchorIndex + 1
				break
			}
		}

		if (insertAt === merged.length) {
			for (let index = cardIndex + 1; index < AllCards.length; index++) {
				const anchorIndex = merged.indexOf(AllCards[index].key)
				if (anchorIndex !== -1) {
					insertAt = anchorIndex
					break
				}
			}
		}

		merged = [...merged.slice(0, insertAt), card.key, ...merged.slice(insertAt)]
	}

	return merged
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
	const flags = useFeatureFlags()
	const isRestoring = useIsRestoring()

	const defaultEntries = useMemo(
		() => getDefaultDashboardOrder(userKind, flags),
		[userKind, flags]
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

	useEffect(() => {
		if (isRestoring || shownDashboardEntries == null) {
			return
		}

		const merged = mergeNewFlaggedCardsIntoDashboard(
			shownDashboardEntries,
			userKind,
			flags
		)

		if (!arraysEqual(merged, shownDashboardEntries)) {
			setShownDashboardEntries(merged)
		}
	}, [
		isRestoring,
		shownDashboardEntries,
		userKind,
		flags,
		setShownDashboardEntries
	])

	const normalizedShownEntries = useMemo(() => {
		const fallback = defaultEntries.shown
		const shownEntries = shownDashboardEntries ?? fallback
		const knownCardKeys = new Set(AllCards.map((card) => card.key))
		const flagOptions = isRestoring ? { skipFeatureFlagCheck: true } : undefined

		return shownEntries
			.filter((key) => knownCardKeys.has(key))
			.filter((key) => isCardKeyEnabled(key, flags, flagOptions))
	}, [shownDashboardEntries, defaultEntries.shown, flags, isRestoring])

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
			const defaultEntries = getDefaultDashboardOrder(userKind, flags)
			if (defaultEntries.shown == null) {
				throw new Error('defaultEntries.shown is null')
			}
			setShownDashboardEntries(defaultEntries.shown)
		},
		[setShownDashboardEntries, flags]
	)

	return {
		shownDashboardEntries: entries,
		resetOrder,
		updateDashboardOrder,
		hiddenAnnouncements: hiddenAnnouncements ?? [],
		hideAnnouncement
	}
}
