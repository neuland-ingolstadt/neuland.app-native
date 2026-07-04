import { useCallback, useEffect, useMemo } from 'react'
import { useMMKVObject } from 'react-native-mmkv'
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

const cardByKey = new Map(AllCards.map((card) => [card.key, card]))

const cardEntries = AllCards.map((card, index) => ({
	card,
	index,
	allowedRoles: new Set(card.allowed),
	initialRoles: new Set(card.initial)
}))

function buildKeyIndex(keys: string[]): Map<string, number> {
	return new Map(keys.map((key, index) => [key, index]))
}

export function isCardEnabled(
	card: Pick<Card, 'featureFlag'>,
	flags: FeatureFlagState
): boolean {
	if (card.featureFlag == null) {
		return true
	}

	return flags[card.featureFlag] === true
}

function isCardKeyEnabled(cardKey: string, flags: FeatureFlagState): boolean {
	const card = cardByKey.get(cardKey)
	if (card == null) {
		return false
	}

	return isCardEnabled(card, flags)
}

export function getDefaultDashboardOrder(
	userKind: string | undefined,
	flags: FeatureFlagState
): DashboardOrder {
	const userRole = userKind ?? USER_GUEST

	const shown: string[] = []
	const unavailable: string[] = []

	for (const { card, allowedRoles, initialRoles } of cardEntries) {
		if (!isCardEnabled(card, flags)) {
			continue
		}

		if (allowedRoles.has(userRole)) {
			if (initialRoles.has(userRole)) {
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
	const merged = [...shownEntries]
	const mergedKeys = new Set(merged)
	let keyIndex = buildKeyIndex(merged)

	for (const {
		card,
		index: cardIndex,
		allowedRoles,
		initialRoles
	} of cardEntries) {
		if (card.featureFlag == null || !isCardEnabled(card, flags)) {
			continue
		}
		if (!allowedRoles.has(userRole) || !initialRoles.has(userRole)) {
			continue
		}
		if (mergedKeys.has(card.key)) {
			continue
		}

		let insertAt = merged.length

		for (let index = cardIndex - 1; index >= 0; index--) {
			const anchorIndex = keyIndex.get(cardEntries[index].card.key)
			if (anchorIndex !== undefined) {
				insertAt = anchorIndex + 1
				break
			}
		}

		if (insertAt === merged.length) {
			for (let index = cardIndex + 1; index < cardEntries.length; index++) {
				const anchorIndex = keyIndex.get(cardEntries[index].card.key)
				if (anchorIndex !== undefined) {
					insertAt = anchorIndex
					break
				}
			}
		}

		merged.splice(insertAt, 0, card.key)
		mergedKeys.add(card.key)
		keyIndex = buildKeyIndex(merged)
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
	const { userKind = USER_GUEST } = useUserKind()
	const flags = useFeatureFlags()

	const defaultEntries = useMemo(
		() => getDefaultDashboardOrder(userKind, flags),
		[userKind, flags]
	)

	useEffect(() => {
		if (shownDashboardEntries == null) {
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
	}, [shownDashboardEntries, userKind, flags, setShownDashboardEntries])

	const normalizedShownEntries = useMemo(() => {
		const fallback = defaultEntries.shown
		const shownEntries = shownDashboardEntries ?? fallback
		const knownCardKeys = new Set(AllCards.map((card) => card.key))
		const normalized: string[] = []

		for (const key of shownEntries) {
			if (!knownCardKeys.has(key)) {
				continue
			}
			if (!isCardKeyEnabled(key, flags)) {
				continue
			}
			normalized.push(key)
		}

		return normalized
	}, [shownDashboardEntries, defaultEntries.shown, flags])

	const entries = useMemo(
		() =>
			normalizedShownEntries.flatMap((key) => {
				const card = cardByKey.get(key)
				return card == null ? [] : [card]
			}),
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
