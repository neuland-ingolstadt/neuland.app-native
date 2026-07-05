import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test'
import { Window as HappyDomWindow } from 'happy-dom'
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import type { FeatureFlagState } from '@/lib/feature-flags'

const SRC_ROOT = new URL('../../', import.meta.url).pathname
const THI_EVENTS_VISIBLE = 'thi-events-visible'

function createDefaultFeatureFlagState(): FeatureFlagState {
	return {
		'thi-events-visible': false,
		'member-officepresence-enabled': false
	}
}

let shownDashboardEntriesState: string[] | undefined
let hiddenAnnouncementsState: string[] | undefined
let userKindState = USER_STUDENT
let featureFlagsState = createDefaultFeatureFlagState()

const setShownDashboardEntriesState = (
	value:
		| string[]
		| undefined
		| ((prev: string[] | undefined) => string[] | undefined)
) => {
	shownDashboardEntriesState =
		typeof value === 'function' ? value(shownDashboardEntriesState) : value
}

const setHiddenAnnouncementsState = (
	value:
		| string[]
		| undefined
		| ((prev: string[] | undefined) => string[] | undefined)
) => {
	hiddenAnnouncementsState =
		typeof value === 'function' ? value(hiddenAnnouncementsState) : value
}

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: { OS: 'web' },
		Share: { share: () => Promise.resolve() },
		Linking: { openURL: async () => {} },
		NativeEventEmitter: class {
			addListener() {
				return { remove: () => {} }
			}
			removeAllListeners() {}
		},
		TurboModuleRegistry: {
			get: () => null,
			getEnforcing: () => null
		}
	},
	Platform: { OS: 'web' },
	Share: { share: () => Promise.resolve() },
	Linking: { openURL: async () => {} },
	NativeEventEmitter: class {
		addListener() {
			return { remove: () => {} }
		}
		removeAllListeners() {}
	},
	TurboModuleRegistry: {
		get: () => null,
		getEnforcing: () => null
	}
}))

mock.module('react-native-mmkv', () => ({
	useMMKVObject: (key: string) => {
		if (key === 'shownDashboardEntriesV7') {
			return [shownDashboardEntriesState, setShownDashboardEntriesState]
		}

		return [hiddenAnnouncementsState, setHiddenAnnouncementsState]
	}
}))

const mockCards = [
	{
		key: 'timetable',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE],
		allowed: [USER_STUDENT, USER_EMPLOYEE],
		card: () => null
	},
	{
		key: 'events',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		card: () => null
	},
	{
		key: 'thiEvents',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		featureFlag: THI_EVENTS_VISIBLE,
		card: () => null
	},
	{
		key: 'sports',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		card: () => null
	},
	{
		key: 'calendar',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		card: () => null
	},
	{
		key: 'links',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		card: () => null
	},
	{
		key: 'news',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE],
		allowed: [USER_STUDENT, USER_EMPLOYEE],
		card: () => null
	},
	{
		key: 'login',
		removable: false,
		initial: [USER_GUEST],
		stillVisible: false,
		allowed: [USER_GUEST],
		card: () => null
	},
	{
		key: 'employeeOnly',
		removable: true,
		initial: [USER_EMPLOYEE],
		allowed: [USER_EMPLOYEE],
		card: () => null
	}
]

mock.module('@/components/all-cards', () => ({
	AllCards: mockCards
}))

mock.module(`${SRC_ROOT}contexts/feature-flags.tsx`, () => ({
	useFeatureFlags: () => featureFlagsState
}))

mock.module(`${SRC_ROOT}contexts/userKind.ts`, () => ({
	useUserKind: () => ({ userKind: userKindState })
}))

function renderDashboardHookWithEffects() {
	let dashboardValue: ReturnType<typeof dashboard.useDashboard> | undefined
	let root: Root | undefined
	const container = document.createElement('div')

	function TestComponent() {
		dashboardValue = dashboard.useDashboard()
		return null
	}

	act(() => {
		root = createRoot(container)
		root.render(React.createElement(TestComponent))
	})

	act(() => {
		root?.render(React.createElement(TestComponent))
	})

	if (dashboardValue == null) {
		throw new Error('useDashboard did not return a value')
	}

	return {
		value: dashboardValue,
		unmount: () => {
			act(() => {
				root?.unmount()
			})
		}
	}
}

function renderDashboardHook() {
	let dashboardValue: ReturnType<typeof dashboard.useDashboard> | undefined

	function TestComponent() {
		dashboardValue = dashboard.useDashboard()
		return null
	}

	renderToString(React.createElement(TestComponent))

	if (dashboardValue == null) {
		throw new Error('useDashboard did not return a value')
	}

	return dashboardValue
}

let dashboard: typeof import('@/contexts/dashboard')

let happyDomWindow: HappyDomWindow | undefined

beforeAll(async () => {
	happyDomWindow = new HappyDomWindow()
	globalThis.document = happyDomWindow.document as unknown as Document
	globalThis.window = happyDomWindow as unknown as Window &
		typeof globalThis.window
	dashboard = await import('@/contexts/dashboard')
})

afterAll(() => {
	happyDomWindow?.close()
	delete (globalThis as { document?: Document }).document
	delete (globalThis as { window?: Window }).window
})

describe('dashboard context', () => {
	it('getDefaultDashboardOrder - Should omit feature-flagged cards when disabled', () => {
		const flags = {
			...createDefaultFeatureFlagState(),
			[THI_EVENTS_VISIBLE]: false
		}

		const { shown } = dashboard.getDefaultDashboardOrder(USER_STUDENT, flags)

		expect(shown).not.toContain('thiEvents')
		expect(shown).toContain('timetable')
		expect(shown).toContain('events')
	})

	it('getDefaultDashboardOrder - Should include login only in shown for guests', () => {
		const flags = createDefaultFeatureFlagState()
		const guestOrder = dashboard.getDefaultDashboardOrder(USER_GUEST, flags)

		expect(guestOrder.shown).toContain('login')
		expect(guestOrder.shown).not.toContain('timetable')
		expect(guestOrder.unavailable).not.toContain('login')
	})

	it('mergeNewFlaggedCardsIntoDashboard - Should insert newly enabled cards in catalog order', () => {
		const flags = {
			...createDefaultFeatureFlagState(),
			[THI_EVENTS_VISIBLE]: true
		}
		const withoutThiEvents = [
			'timetable',
			'events',
			'sports',
			'calendar',
			'links',
			'news'
		]

		const merged = dashboard.mergeNewFlaggedCardsIntoDashboard(
			withoutThiEvents,
			USER_STUDENT,
			flags
		)

		expect(merged).toEqual([
			'timetable',
			'events',
			'thiEvents',
			'sports',
			'calendar',
			'links',
			'news'
		])
	})

	it('mergeNewFlaggedCardsIntoDashboard - Should leave order unchanged when card is already shown', () => {
		const flags = {
			...createDefaultFeatureFlagState(),
			[THI_EVENTS_VISIBLE]: true
		}
		const customOrder = ['events', 'timetable', 'thiEvents', 'links']

		const merged = dashboard.mergeNewFlaggedCardsIntoDashboard(
			customOrder,
			USER_STUDENT,
			flags
		)

		expect(merged).toEqual(customOrder)
	})

	it('isCardEnabled - Should treat cards without flags as enabled', () => {
		expect(
			dashboard.isCardEnabled(
				{ featureFlag: undefined },
				createDefaultFeatureFlagState()
			)
		).toBe(true)
	})

	it('isCardEnabled - Should return false when feature flag is disabled', () => {
		expect(
			dashboard.isCardEnabled(
				{ featureFlag: THI_EVENTS_VISIBLE },
				createDefaultFeatureFlagState()
			)
		).toBe(false)
	})

	it('isCardKeyEnabled - Should return false for unknown card keys', () => {
		expect(
			dashboard.isCardKeyEnabled(
				'unknown-card',
				createDefaultFeatureFlagState()
			)
		).toBe(false)
	})

	it('isCardKeyEnabled - Should respect feature flags for known cards', () => {
		const flags = {
			...createDefaultFeatureFlagState(),
			[THI_EVENTS_VISIBLE]: true
		}

		expect(dashboard.isCardKeyEnabled('thiEvents', flags)).toBe(true)
		expect(
			dashboard.isCardKeyEnabled('thiEvents', createDefaultFeatureFlagState())
		).toBe(false)
	})

	it('getDefaultDashboardOrder - Should list disallowed cards in unavailable when still visible', () => {
		const flags = createDefaultFeatureFlagState()
		const { shown, unavailable } = dashboard.getDefaultDashboardOrder(
			USER_STUDENT,
			flags
		)

		expect(shown).not.toContain('employeeOnly')
		expect(unavailable).toContain('employeeOnly')
	})

	it('mergeNewFlaggedCardsIntoDashboard - Should anchor insertion using a later visible card', () => {
		const flags = {
			...createDefaultFeatureFlagState(),
			[THI_EVENTS_VISIBLE]: true
		}

		const merged = dashboard.mergeNewFlaggedCardsIntoDashboard(
			['sports'],
			USER_STUDENT,
			flags
		)

		expect(merged).toEqual(['thiEvents', 'sports'])
	})

	it('mergeNewFlaggedCardsIntoDashboard - Should prepend flagged cards when no anchors exist', () => {
		const flags = {
			...createDefaultFeatureFlagState(),
			[THI_EVENTS_VISIBLE]: true
		}

		const merged = dashboard.mergeNewFlaggedCardsIntoDashboard(
			[],
			USER_STUDENT,
			flags
		)

		expect(merged).toEqual(['thiEvents'])
	})

	it('syncDashboardEntriesWithFlags - Should return merged order when a flagged card is missing', () => {
		const flags = {
			...createDefaultFeatureFlagState(),
			[THI_EVENTS_VISIBLE]: true
		}

		const merged = dashboard.syncDashboardEntriesWithFlags(
			['events', 'timetable'],
			USER_STUDENT,
			flags
		)

		expect(merged).toEqual(['events', 'thiEvents', 'timetable'])
	})

	it('syncDashboardEntriesWithFlags - Should return null when order is already up to date', () => {
		const flags = {
			...createDefaultFeatureFlagState(),
			[THI_EVENTS_VISIBLE]: true
		}

		const merged = dashboard.syncDashboardEntriesWithFlags(
			['events', 'timetable', 'thiEvents'],
			USER_STUDENT,
			flags
		)

		expect(merged).toBeNull()
	})

	it('normalizeShownDashboardEntries - Should drop unknown and disabled cards', () => {
		const flags = createDefaultFeatureFlagState()
		const normalized = dashboard.normalizeShownDashboardEntries(
			['unknown-card', 'thiEvents', 'timetable'],
			flags
		)

		expect(normalized).toEqual(['timetable'])
	})

	it('resolveDashboardCards - Should map keys to cards and ignore unknown keys', () => {
		const cards = dashboard.resolveDashboardCards(['timetable', 'unknown-card'])

		expect(cards.map((card) => card.key)).toEqual(['timetable'])
	})

	it('useDashboard - Should resolve stored entries and fall back to defaults', () => {
		shownDashboardEntriesState = ['events', 'unknown-card', 'thiEvents']
		hiddenAnnouncementsState = undefined
		userKindState = USER_STUDENT
		featureFlagsState = createDefaultFeatureFlagState()

		const value = renderDashboardHook()

		expect(value.shownDashboardEntries.map((card) => card.key)).toEqual([
			'events'
		])
		expect(value.hiddenAnnouncements).toEqual([])
	})

	it('useDashboard - Should skip merge effect when no stored order exists', () => {
		shownDashboardEntriesState = undefined
		hiddenAnnouncementsState = undefined
		userKindState = USER_STUDENT
		featureFlagsState = createDefaultFeatureFlagState()

		const { value, unmount } = renderDashboardHookWithEffects()

		expect(value.shownDashboardEntries.map((card) => card.key)).toEqual(
			dashboard.getDefaultDashboardOrder(USER_STUDENT, featureFlagsState).shown
		)
		expect(shownDashboardEntriesState).toBeUndefined()

		unmount()
	})

	it('useDashboard - Should merge newly enabled flagged cards into stored order', () => {
		shownDashboardEntriesState = ['events', 'timetable']
		hiddenAnnouncementsState = undefined
		userKindState = USER_STUDENT
		featureFlagsState = {
			...createDefaultFeatureFlagState(),
			[THI_EVENTS_VISIBLE]: true
		}

		const { value, unmount } = renderDashboardHookWithEffects()

		expect(value.shownDashboardEntries.map((card) => card.key)).toEqual([
			'events',
			'thiEvents',
			'timetable'
		])
		expect(shownDashboardEntriesState).toEqual([
			'events',
			'thiEvents',
			'timetable'
		])

		unmount()
	})

	it('useDashboard - Should expose dashboard actions', () => {
		shownDashboardEntriesState = undefined
		hiddenAnnouncementsState = undefined
		userKindState = USER_STUDENT
		featureFlagsState = createDefaultFeatureFlagState()

		const value = renderDashboardHook()

		value.updateDashboardOrder(['events', 'timetable'])
		if (shownDashboardEntriesState == null) {
			throw new Error('expected shown dashboard entries to be set')
		}
		expect(shownDashboardEntriesState).toEqual(['events', 'timetable'])

		value.hideAnnouncement('announcement-1')
		if (hiddenAnnouncementsState == null) {
			throw new Error('expected hidden announcements to be set')
		}
		expect(hiddenAnnouncementsState).toEqual(['announcement-1'])

		value.resetOrder(USER_STUDENT)
		if (shownDashboardEntriesState == null) {
			throw new Error('expected shown dashboard entries to be reset')
		}
		expect(shownDashboardEntriesState).toEqual(
			dashboard.getDefaultDashboardOrder(USER_STUDENT, featureFlagsState).shown
		)
	})
})
