import { type FormListSections } from '@/types/components'
import {
    type BuildingOccupancy,
    type RoomData,
    SEARCH_TYPES,
} from '@/types/map'
import { type AvailableRoom } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'
import { type TFunction } from 'i18next'

/**
 * Formats the content of the room details section
 * @param {RoomData} roomData - Data for the room
 * @param {any} t - Translation function
 * @param {any} locations - Locations
 * @returns {FormListSections[]}
 * */
export const modalSection = (
    roomData: RoomData,
    locations: any,
    t: TFunction<any>
): FormListSections[] => {
    if (
        roomData.type === SEARCH_TYPES.ROOM &&
        (roomData.occupancies !== null || roomData.properties !== null)
    ) {
        const occupancies = roomData.occupancies as AvailableRoom
        return [
            {
                header: t('pages.map.details.room.availability'),
                items:
                    roomData.occupancies == null
                        ? [
                              {
                                  title: t('pages.map.details.room.available'),
                                  value: t(
                                      'pages.map.details.room.notAvailable'
                                  ),
                              },
                          ]
                        : [
                              {
                                  title: t('pages.map.details.room.timeLeft'),
                                  value: (() => {
                                      const timeLeft =
                                          new Date(
                                              occupancies.until
                                          ).getTime() - new Date().getTime()
                                      const minutes = Math.floor(
                                          (timeLeft / 1000 / 60) % 60
                                      )
                                      const hours = Math.floor(
                                          (timeLeft / (1000 * 60 * 60)) % 24
                                      )
                                      const formattedMinutes =
                                          minutes < 10 ? `0${minutes}` : minutes
                                      return `${hours}:${formattedMinutes}h`
                                  })(),
                              },
                              {
                                  title: t('pages.map.details.room.timeSpan'),
                                  value: `${formatFriendlyTime(
                                      occupancies.from
                                  )} - ${formatFriendlyTime(
                                      occupancies.until
                                  )}`,
                              },
                          ],
            },
            ...(roomData.properties !== null
                ? [
                      {
                          header: t('pages.map.details.room.details'),
                          items: [
                              {
                                  title: t('pages.map.details.room.type'),
                                  value:
                                      roomData.properties.Funktion_en ??
                                      t('misc.unknown'),
                              },
                              ...(occupancies != null
                                  ? [
                                        {
                                            title: t(
                                                'pages.map.details.room.capacity'
                                            ),
                                            value: `${occupancies.capacity} ${t('pages.rooms.options.seats')}`,
                                        },
                                    ]
                                  : []),
                              {
                                  title: t('pages.map.details.room.building'),
                                  value:
                                      roomData.properties.Gebaeude ??
                                      t('misc.unknown'),
                              },
                              {
                                  title: t('pages.map.details.room.floor'),
                                  value:
                                      roomData.properties.Ebene ??
                                      t('misc.unknown'),
                              },
                              {
                                  title: 'Campus',
                                  value:
                                      locations[roomData.properties.Standort] ??
                                      t('misc.unknown'),
                              },
                          ],
                      },
                  ]
                : []),
        ]
    } else if (
        roomData.type === SEARCH_TYPES.BUILDING &&
        roomData.properties != null &&
        roomData.occupancies != null
    ) {
        const occupancies = roomData.occupancies as BuildingOccupancy
        return [
            {
                header: t('pages.map.details.room.details'),
                items: [
                    {
                        title: t('pages.map.details.building.total'),
                        value: occupancies.total,
                    },
                    {
                        title: t('pages.map.details.building.free'),
                        value: occupancies.available ?? t('misc.unknown'),
                    },
                    {
                        title: t('pages.map.details.building.floors'),
                        value: roomData.properties.Etage,
                    },
                    {
                        title: 'Campus',
                        value: locations[roomData.properties.Standort],
                    },
                ],
            },
        ]
    }

    return []
}
