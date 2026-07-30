import { beforeAll, describe, expect, it, mock } from 'bun:test'
import type { TFunction } from 'i18next'
import type { Meal } from '@/types/neuland-api'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const platform = { OS: 'web' as 'web' | 'ios' | 'android' }
const shareMock = mock(async () => {})
const openUrlMock = mock(async () => {})
const clipboardSetStringAsyncMock = mock(async () => {})
const trackEventMock = mock(() => {})
const mockGetFoodPlan = mock(
	async (): Promise<{ food: unknown }> => ({ food: [] })
)
const mockGetFragmentData = mock(() => ({ foodData: [] as unknown[] }))

mock.module(`${SRC_ROOT}localization/i18n.ts`, () => ({
	default: { language: 'de' }
}))

mock.module('expo-localization', () => ({
	getLocales: () => [{ languageCode: 'de' }]
}))

mock.module('react-i18next', () => ({
	initReactI18next: {}
}))

mock.module('react-native', () => ({
	__esModule: true,
	default: {
		Platform: platform,
		Share: { share: shareMock },
		Linking: { openURL: openUrlMock },
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
	Platform: platform,
	Share: { share: shareMock },
	Linking: { openURL: openUrlMock },
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

mock.module('@aptabase/react-native', () => ({
	trackEvent: trackEventMock
}))

mock.module('expo-clipboard', () => ({
	setStringAsync: clipboardSetStringAsyncMock
}))

mock.module('burnt', () => ({
	toast: () => {}
}))

mock.module(`${SRC_ROOT}__generated__/gql/graphql.ts`, () => ({
	FoodFieldsFragmentDoc: {},
	UniversitySportsFieldsFragmentDoc: {}
}))

mock.module(`${SRC_ROOT}__generated__/gql/index.ts`, () => ({
	getFragmentData: mockGetFragmentData
}))

mock.module(`${SRC_ROOT}api/neuland-api.ts`, () => ({
	default: {
		getFoodPlan: mockGetFoodPlan
	}
}))

mock.module(`${SRC_ROOT}components/Universal/icon.tsx`, () => ({
	linkIcon: {
		ios: 'link',
		android: 'link',
		web: 'Link'
	}
}))

let mealDetailSections: typeof import('../meal-detail-sections')

const t = ((key: string, options?: { ns?: string; [key: string]: unknown }) => {
	if (options?.ns === 'common') {
		return `common:${key}`
	}
	if (key === 'details.formlist.allergenFooter') {
		return `allergens:${options?.allergens}`
	}
	if (key === 'details.share.message') {
		return `share:${options?.meal}:${options?.price}:${options?.location}:${options?.id}`
	}
	return key
}) as TFunction<'food'>

const makeMeal = (overrides: Partial<Meal> = {}): Meal =>
	({
		id: 'meal-1',
		static: false,
		name: { de: 'Gericht', en: 'Meal' },
		category: 'Hauptgericht',
		prices: { guest: 4.5, employee: 3.5, student: 2.5 },
		allergens: ['Ei'],
		flags: ['V'],
		nutrition: {
			kj: 1000,
			kcal: 240,
			fat: 10,
			fatSaturated: 3,
			carbs: 20,
			sugar: 5,
			fiber: 2,
			protein: 12,
			salt: 1
		},
		variants: [
			{
				id: 'variant-1',
				additional: true,
				name: { de: 'Groß', en: 'Large' },
				prices: { guest: 1, employee: 1, student: 1 }
			}
		],
		originalLanguage: 'de',
		restaurant: 'IngolstadtMensa',
		...overrides
	}) as Meal

const baseParams = () => ({
	foodData: makeMeal(),
	t,
	language: 'de' as const,
	userKind: 'student',
	restaurant: 'IngolstadtMensa',
	humanLocation: 'Mensa Ingolstadt',
	locationExists: true,
	preferencesSelection: ['V'],
	allergenSelection: [] as string[],
	successColor: '#00ff00',
	notificationColor: '#ff0000',
	primaryColor: '#007aff',
	onItemAlert: mock(() => {}),
	onNavigateToRestaurant: mock(() => {})
})

beforeAll(async () => {
	mealDetailSections = await import('../meal-detail-sections')
})

describe('meal-detail-sections', () => {
	it('isMealNutritionAvailable - Should return true when all nutrition values are present', () => {
		expect(mealDetailSections.isMealNutritionAvailable(makeMeal())).toBe(true)
	})

	it('isMealNutritionAvailable - Should return false when nutrition is missing or empty', () => {
		expect(
			mealDetailSections.isMealNutritionAvailable(makeMeal({ nutrition: null }))
		).toBe(false)
		expect(
			mealDetailSections.isMealNutritionAvailable(
				makeMeal({
					nutrition: {
						kj: 0,
						kcal: 240,
						fat: 10,
						fatSaturated: 3,
						carbs: 20,
						sugar: 5,
						fiber: 2,
						protein: 12,
						salt: 1
					}
				})
			)
		).toBe(false)
	})

	it('isMensaRestaurant - Should identify mensa restaurants', () => {
		expect(mealDetailSections.isMensaRestaurant('IngolstadtMensa')).toBe(true)
		expect(mealDetailSections.isMensaRestaurant('NeuburgMensa')).toBe(true)
		expect(mealDetailSections.isMensaRestaurant('Reimanns')).toBe(false)
	})

	it('getMealHumanLocation - Should resolve known restaurant labels', () => {
		expect(mealDetailSections.getMealHumanLocation('IngolstadtMensa')).toBe(
			'Mensa Ingolstadt'
		)
	})

	it('hasMealRestaurantLocation - Should detect mapped restaurant locations', () => {
		expect(
			mealDetailSections.hasMealRestaurantLocation('IngolstadtMensa')
		).toBe(true)
		expect(mealDetailSections.hasMealRestaurantLocation('Reimanns')).toBe(true)
		expect(mealDetailSections.hasMealRestaurantLocation('Unknown')).toBe(false)
	})

	it('buildMealDetailSections - Should include mensa sections for mensa restaurants', () => {
		const sections = mealDetailSections.buildMealDetailSections(baseParams())
		const headers = sections.map((section) => section.header)

		expect(headers).toContain('details.formlist.variants')
		expect(headers).toContain('preferences.formlist.flags')
		expect(headers).toContain('preferences.formlist.allergens')
		expect(headers).toContain('details.formlist.nutrition.title')
		expect(headers).toContain('details.formlist.about.title')
	})

	it('buildMealDetailSections - Should omit mensa sections for non-mensa restaurants', () => {
		const params = {
			...baseParams(),
			foodData: makeMeal({ restaurant: 'Reimanns' }),
			restaurant: 'Reimanns'
		}
		const sections = mealDetailSections.buildMealDetailSections(params)
		const headers = sections.map((section) => section.header)

		expect(headers).toContain('details.formlist.variants')
		expect(headers).toContain('details.formlist.about.title')
		expect(headers).not.toContain('preferences.formlist.flags')
	})

	it('buildMensaSection - Should wire allergen and flag presses to onItemAlert', () => {
		const onItemAlert = mock(() => {})
		const sections = mealDetailSections.buildMensaSection({
			...baseParams(),
			onItemAlert
		})

		const flagItem = sections[0]?.items?.[0]
		const allergenItem = sections[1]?.items?.[0]

		flagItem?.onPress?.()
		allergenItem?.onPress?.()

		expect(onItemAlert).toHaveBeenCalledWith('V', 'flag')
		expect(onItemAlert).toHaveBeenCalledWith('Ei', 'allergen')
	})

	it('buildMensaSection - Should mark selected allergens and flags with icons', () => {
		const sections = mealDetailSections.buildMensaSection({
			...baseParams(),
			allergenSelection: ['Ei']
		})

		expect(sections[0]?.items?.[0]?.icon).toBeDefined()
		expect(sections[1]?.items?.[0]?.icon).toBeDefined()
	})

	it('buildAboutSection - Should navigate to restaurant and open source link', () => {
		const onNavigateToRestaurant = mock(() => {})
		const sections = mealDetailSections.buildAboutSection({
			...baseParams(),
			onNavigateToRestaurant
		})

		const restaurantItem = sections[0]?.items?.[0]
		const sourceItem = sections[0]?.items?.[2]

		restaurantItem?.onPress?.()
		sourceItem?.onPress?.()

		expect(onNavigateToRestaurant).toHaveBeenCalled()
		expect(openUrlMock).toHaveBeenCalledWith(
			'https://www.werkswelt.de/?id=ingo'
		)
	})

	it('buildVariantsSection - Should copy variant share message on web', () => {
		platform.OS = 'web'
		trackEventMock.mockReset()
		clipboardSetStringAsyncMock.mockReset()
		shareMock.mockReset()

		const sections = mealDetailSections.buildVariantsSection(
			makeMeal(),
			t,
			'de',
			'student',
			'IngolstadtMensa'
		)

		sections[0]?.items?.[0]?.onPress?.()

		expect(trackEventMock).toHaveBeenCalledWith('Share', {
			type: 'mealVariant'
		})
		expect(clipboardSetStringAsyncMock).toHaveBeenCalledWith(
			'share:Groß:1.00 €:IngolstadtMensa:variant-1'
		)
		expect(shareMock).not.toHaveBeenCalled()

		platform.OS = 'web'
	})

	it('buildVariantsSection - Should use native share sheet off web', () => {
		platform.OS = 'ios'
		trackEventMock.mockReset()
		clipboardSetStringAsyncMock.mockReset()
		shareMock.mockReset()

		const sections = mealDetailSections.buildVariantsSection(
			makeMeal(),
			t,
			'de',
			'guest',
			'IngolstadtMensa'
		)

		sections[0]?.items?.[0]?.onPress?.()

		expect(shareMock).toHaveBeenCalledWith({
			message: 'share:Groß:1.00 €:IngolstadtMensa:variant-1'
		})
		expect(clipboardSetStringAsyncMock).not.toHaveBeenCalled()

		platform.OS = 'web'
	})
})
