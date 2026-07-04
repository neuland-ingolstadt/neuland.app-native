import { beforeAll, describe, expect, it, mock } from 'bun:test'
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
	useMMKVObject: () => [undefined, () => {}]
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
	}
]

mock.module('@/components/all-cards', () => ({
	AllCards: mockCards
}))

mock.module(`${SRC_ROOT}contexts/feature-flags.tsx`, () => ({
	useFeatureFlags: () => createDefaultFeatureFlagState()
}))

mock.module(`${SRC_ROOT}contexts/userKind.ts`, () => ({
	useUserKind: () => ({ userKind: USER_STUDENT })
}))

let dashboard: typeof import('@/contexts/dashboard')

beforeAll(async () => {
	dashboard = await import('@/contexts/dashboard')
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
})
