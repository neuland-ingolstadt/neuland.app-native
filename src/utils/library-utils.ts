import API from '@/api/authenticated-api'
import {
    type AvailableLibrarySeats,
    type AvailableRoom,
    type AvailableRoomItem,
} from '@/types/thi-api'
import { combineDateTime } from '@/utils/date-utils'

/**
 * Converts the seat list for easier processing.
 * @returns {object}
 */
export async function getFriendlyAvailableLibrarySeats(): Promise<
    AvailableLibrarySeats[]
> {
    const available = await API.getAvailableLibrarySeats()
    return available.map((day) => {
        const date = day.date.substring(0, 10)

        return {
            date,
            resource: day.resource.map((slot) => {
                const from = combineDateTime(date, slot.from)
                const to = combineDateTime(date, slot.to)

                return {
                    ...slot,
                    from,
                    to,
                }
            }),
        }
    })
}

/**
 * Get the available rooms.
 * @param {object} item
 * @returns {array}
 */
export function getAvailableRooms(
    item: AvailableRoomItem
): Array<[string, AvailableRoom, number]> {
    return Object.entries(item.resources)
        .map(([roomId, room], idx) => {
            // Remove "Lesesaal" from room_name
            const updatedRoom = {
                ...room,
                room_name: room.room_name.replace('Lesesaal ', ''),
            }
            return [roomId, updatedRoom, idx] as [string, AvailableRoom, number]
        })
        .filter(
            ([, room]: [string, AvailableRoom, number]) => room.num_seats > 0
        )
}
