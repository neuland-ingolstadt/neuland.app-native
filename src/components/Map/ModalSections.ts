import i18n from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import {
	type BuildingOccupancy,
	type RoomData,
	SEARCH_TYPES
} from '@/types/map'
import type { AvailableRoom } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { t } from 'i18next'

type LocationsType = Record<string, string>

/**
 * Formats the content of the room details section
 * @param {RoomData} roomData - Data for the room
 * @param {any} t - Translation function
 * @param {any} locations - Locations
 * @param {string} language - Language
 * @returns {FormListSections[]}
 * */
export const modalSection = (
	roomData: RoomData,
	locations: LocationsType,
	isGuest: boolean
): FormListSections[] => {
	const roomTypeKey = i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en'

	if (
		roomData.type === SEARCH_TYPES.ROOM &&
		((roomData.occupancies !== null &&
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			roomData.occupancies !== undefined) ||
			(roomData.properties !== null && roomData.properties !== undefined))
	) {
		const occupancies = roomData.occupancies as AvailableRoom
		return [
			...(!isGuest
				? [
						{
							header: t('pages.map.details.room.availability', {
								ns: 'common'
							}),
							items:
								roomData.occupancies == null
									? [
											{
												title: t('pages.map.details.room.available', {
													ns: 'common'
												}),
												value: t('pages.map.details.room.notAvailable', {
													ns: 'common'
												})
											}
										]
									: [
											{
												title: t('pages.map.details.room.timeLeft', {
													ns: 'common'
												}),
												value: (() => {
													const timeLeft =
														new Date(occupancies.until).getTime() -
														new Date().getTime()
													const minutes = Math.floor(
														(timeLeft / 1000 / 60) % 60
													)
													const hours = Math.floor(
														(timeLeft / (1000 * 60 * 60)) % 24
													)
													const formattedMinutes =
														minutes < 10 ? `0${minutes.toString()}` : minutes
													return `${hours.toString()}:${formattedMinutes.toString()}h`
												})()
											},
											{
												title: t('pages.map.details.room.timeSpan', {
													ns: 'common'
												}),
												value: `${formatFriendlyTime(
													occupancies.from
												)} - ${formatFriendlyTime(occupancies.until)}`
											}
										]
						}
					]
				: []),
			...(roomData.properties !== null
				? [
						{
							header: t('pages.map.details.room.details', {
								ns: 'common'
							}),
							items: [
								// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
								...(occupancies != null
									? [
											{
												title: t('pages.map.details.room.capacity', {
													ns: 'common'
												}),
												value: `${occupancies.capacity.toString()} ${t('pages.rooms.options.seats', { ns: 'common' })}`
											}
										]
									: []),
								{
									title: t('pages.map.details.room.building', {
										ns: 'common'
									}),
									value:
										roomData.properties?.Gebaeude ??
										t('misc.unknown', { ns: 'common' })
								},
								{
									title: t('pages.map.details.room.floor', {
										ns: 'common'
									}),
									value:
										roomData.properties?.Ebene ??
										t('misc.unknown', { ns: 'common' })
								},
								{
									title: t('pages.map.details.room.type', {
										ns: 'common'
									}),
									value:
										roomData.properties?.[roomTypeKey] ??
										t('misc.unknown', { ns: 'common' })
								},
								{
									title: 'Campus',
									value:
										locations[
											// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
											roomData.properties?.Standort
										] ?? t('misc.unknown', { ns: 'common' })
								}
							]
						}
					]
				: [])
		]
	}
	if (
		roomData.type === SEARCH_TYPES.BUILDING &&
		roomData.properties != null &&
		roomData.occupancies != null
	) {
		const occupancies = roomData.occupancies as BuildingOccupancy
		const properties: RoomData['properties'] = roomData.properties
		return [
			{
				header: t('pages.map.details.room.details', { ns: 'common' }),
				items: [
					{
						title: t('pages.map.details.building.total', {
							ns: 'common'
						}),
						value:
							occupancies.total.toString() ??
							t('misc.unknown', { ns: 'common' })
					},
					{
						title: t('pages.map.details.building.free', {
							ns: 'common'
						}),
						value:
							occupancies.available.toString() ??
							t('misc.unknown', { ns: 'common' })
					},
					{
						title: t('pages.map.details.building.floors', {
							ns: 'common'
						}),
						value:
							(properties.Etage as string | null)?.toString() ??
							t('misc.unknown', { ns: 'common' })
					},
					{
						title: 'Campus',
						value: locations?.[properties.Standort]
					}
				]
			}
		]
	}

	return []
}
