import { beforeAll, describe, expect, it, mock } from 'bun:test'
import type {
	PublicEventResponse,
	PublicOrganizerResponse
} from '@/types/campus-life'
import {
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
} from '@/types/campus-life'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const mockGetPublicCampusLifeEvents = mock(
	async () => [] as PublicEventResponse[]
)
const mockGetPublicCampusLifeEvent = mock(
	async (): Promise<PublicEventResponse> => ({
		id: 1,
		organizer_id: 10,
		title_de: 'Fallback Event',
		title_en: 'Fallback Event',
		start_date_time: '2030-01-01T10:00:00Z',
		end_date_time: '2030-01-01T12:00:00Z'
	})
)
const mockGetPublicOrganizer = mock(
	async (): Promise<PublicOrganizerResponse> => ({
		id: 10,
		name: 'Fallback Organizer'
	})
)
const mockGetPublicOrganizers = mock(
	async (): Promise<PublicOrganizerResponse[]> => []
)
const mockGetUniversitySports = mock(async () => ({
	universitySports: []
}))
const mockGetFragmentData = mock(() => null as unknown)

const registerEventsApiMocks = () => {
	mock.module(`${SRC_ROOT}api/neuland-api.ts`, () => ({
		default: {
			getPublicCampusLifeEvents: mockGetPublicCampusLifeEvents,
			getPublicCampusLifeEvent: mockGetPublicCampusLifeEvent,
			getPublicOrganizer: mockGetPublicOrganizer,
			getPublicOrganizers: mockGetPublicOrganizers,
			getUniversitySports: mockGetUniversitySports
		}
	}))

	mock.module(`${SRC_ROOT}__generated__/gql/index.ts`, () => ({
		getFragmentData: mockGetFragmentData
	}))
}

mock.module(`${SRC_ROOT}__generated__/gql/graphql.ts`, () => ({
	FoodFieldsFragmentDoc: {},
	UniversitySportsFieldsFragmentDoc: {}
}))

let eventsUtils: typeof import('../events-utils')

beforeAll(async () => {
	registerEventsApiMocks()
	eventsUtils = await import('../events-utils')
})

describe('events-utils', () => {
	it('sportsCategories - Should expose expected sport keys and icon mappings', () => {
		expect(eventsUtils.sportsCategories.Basketball).toEqual({
			iosIcon: 'figure.basketball',
			androidIcon: 'sports_basketball'
		})
		expect(eventsUtils.sportsCategories.Running).toEqual({
			iosIcon: 'figure.run',
			androidIcon: 'directions_run'
		})
		expect(eventsUtils.sportsCategories.Other.androidIcon).toBe('sports')
		expect(Object.keys(eventsUtils.sportsCategories)).toContain('Yoga')
	})

	it('loadCampusLifeEvents - Should map API events and filter empty titles and past events', async () => {
		mockGetPublicCampusLifeEvents.mockResolvedValueOnce([
			{
				id: 1,
				organizer_id: 5,
				organizer_kind: 'STUDENT_ASSOCIATION',
				organizer_name: 'Neuland',
				title_de: '  ',
				title_en: '',
				start_date_time: '2030-06-01T18:00:00Z',
				end_date_time: '2030-06-01T20:00:00Z'
			},
			{
				id: 2,
				organizer_id: 6,
				organizer_kind: 'THI_DEPARTMENT',
				organizer_name: null,
				title_de: 'Past Event',
				title_en: 'Past Event',
				start_date_time: '2020-01-01T10:00:00Z',
				end_date_time: '2020-01-01T12:00:00Z'
			},
			{
				id: 3,
				organizer_id: 7,
				title_de: 'Future Event',
				title_en: 'Future Event',
				description_de: 'Beschreibung',
				start_date_time: '2030-07-01T10:00:00Z',
				end_date_time: '2030-07-01T12:00:00Z',
				location: 'Aula',
				event_url: 'https://example.com'
			}
		])

		const events = await eventsUtils.loadCampusLifeEvents({
			organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
			upcomingOnly: true,
			limit: 10
		})

		expect(mockGetPublicCampusLifeEvents).toHaveBeenCalledWith({
			organizerId: undefined,
			upcomingOnly: true,
			limit: 10,
			offset: undefined,
			organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
		})
		expect(events).toHaveLength(1)
		expect(events[0]).toMatchObject({
			id: '3',
			numericId: 3,
			titles: { de: 'Future Event', en: 'Future Event' },
			location: 'Aula',
			eventUrl: 'https://example.com',
			host: {
				id: 7,
				name: 'Campus Life'
			}
		})
	})

	it('loadCampusLifeEvent - Should map a single event with organizer fallbacks', async () => {
		mockGetPublicCampusLifeEvent.mockResolvedValueOnce({
			id: 42,
			organizer_id: 99,
			organizer_kind: 'THI_DEPARTMENT',
			organizer_name: 'Faculty of Computer Science',
			title_de: 'Vortrag',
			title_en: 'Lecture',
			description_en: 'Details',
			start_date_time: '2030-03-01T14:00:00Z',
			end_date_time: '2030-03-01T16:00:00Z'
		})

		const event = await eventsUtils.loadCampusLifeEvent(42)

		expect(event).toMatchObject({
			id: '42',
			organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT,
			host: {
				id: 99,
				name: 'Faculty of Computer Science'
			}
		})
	})

	it('loadCampusLifeOrganizer - Should map organizer fields with null fallbacks', async () => {
		mockGetPublicOrganizer.mockResolvedValueOnce({
			id: 12,
			organizer_kind: 'STUDENT_ASSOCIATION',
			name: 'Robotics Club',
			description_de: null,
			description_en: 'We build robots',
			instagram_url: 'https://instagram.com/robotics',
			website_url: null,
			location: 'Lab 1'
		})

		const organizer = await eventsUtils.loadCampusLifeOrganizer(12)

		expect(organizer).toEqual({
			id: 12,
			organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
			name: 'Robotics Club',
			descriptions: { de: null, en: 'We build robots' },
			location: 'Lab 1',
			instagram: 'https://instagram.com/robotics',
			website: null,
			linkedin: null,
			nonProfit: null,
			registrationNumber: null
		})
	})

	it('loadCampusLifeOrganizers - Should map a list of organizers', async () => {
		mockGetPublicOrganizers.mockResolvedValueOnce([
			{
				id: 1,
				name: 'Club A',
				organizer_kind: 'STUDENT_ASSOCIATION'
			},
			{
				id: 2,
				name: 'Department B',
				organizer_kind: 'THI_DEPARTMENT'
			}
		])

		const organizers = await eventsUtils.loadCampusLifeOrganizers(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
		)

		expect(organizers).toHaveLength(2)
		expect(organizers[1].organizerKind).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
		)
	})

	it('loadUniversitySportsEvents - Should return an empty list when fragment data is missing', async () => {
		mockGetUniversitySports.mockResolvedValueOnce({
			universitySports: null
		} as unknown as Awaited<ReturnType<typeof mockGetUniversitySports>>)
		mockGetFragmentData.mockReturnValueOnce(null)

		await expect(eventsUtils.loadUniversitySportsEvents()).resolves.toEqual([])
	})

	it('loadUniversitySportsEvents - Should group events by weekday in calendar order', async () => {
		mockGetUniversitySports.mockResolvedValueOnce({
			universitySports: ['payload']
		} as unknown as Awaited<ReturnType<typeof mockGetUniversitySports>>)
		mockGetFragmentData.mockReturnValueOnce([
			{
				id: '1',
				weekday: 'Wednesday',
				campus: 'INGOLSTADT',
				location: 'Sports hall',
				startTime: '18:00',
				endTime: '19:30',
				requiresRegistration: false,
				invitationLink: null,
				eMail: null,
				sportsCategory: 'Basketball',
				title: { de: 'Basketball', en: 'Basketball' },
				description: null
			},
			{
				id: '2',
				weekday: 'Monday',
				campus: 'INGOLSTADT',
				location: 'Gym',
				startTime: '17:00',
				endTime: null,
				requiresRegistration: true,
				invitationLink: null,
				eMail: null,
				sportsCategory: 'Yoga',
				title: { de: 'Yoga', en: 'Yoga' },
				description: null
			}
		])

		const sections = await eventsUtils.loadUniversitySportsEvents()

		expect(sections).toEqual([
			{
				title: 'Monday',
				data: [
					expect.objectContaining({
						id: '2',
						weekday: 'Monday'
					})
				]
			},
			{
				title: 'Wednesday',
				data: [
					expect.objectContaining({
						id: '1',
						weekday: 'Wednesday'
					})
				]
			}
		])
	})
})
