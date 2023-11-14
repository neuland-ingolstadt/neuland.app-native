import i18n from '@/localization/i18n'
import { type FriendlyDateOptions } from '@/types/utils'
import type dayjs from 'dayjs'
// required by react-native-big-calendar (thats why we have moment and dayjs)
import moment from 'moment'
import 'moment/locale/de'

function t(...args: any): any {
    return i18n.t(args, { ns: 'common' })
}

/**
 * Formats a date like "Mo., 1.10.2020"
 * @param {Date|string} datetime
 * @param {FriendlyDateOptions} options
 * @returns {string}
 */
export function formatFriendlyDate(
    datetime: Date | string,
    options: FriendlyDateOptions = {
        weekday: 'short',
        relative: true,
    }
): string {
    const date = moment(datetime)
    const today = moment()
    const tomorrow = moment().add(1, 'days')

    if (date.isSame(today, 'day') && options.relative !== false) {
        return t('dates.today')
    } else if (date.isSame(tomorrow, 'day') && options.relative !== false) {
        return t('dates.tomorrow')
    } else {
        const weekday = date.format(
            options.weekday === 'short' ? 'ddd' : 'dddd'
        )
        const dayMonthYear = date.locale('de').format('D.M.YYYY')
        return `${weekday}, ${dayMonthYear}`
    }
}

/**
 * Formats a date range like "Mo., 1.10.2021 - Di., 2.10.2021"
 * @param {Date} begin
 * @param {Date} end
 * @returns {string}
 */
export function formatFriendlyDateRange(begin: Date, end?: Date): string {
    let str = formatFriendlyDate(begin)
    if (end != null && begin.toDateString() !== end.toDateString()) {
        str += ' – ' + formatFriendlyDate(end)
    }
    return str
}

/**
 * Formats a time like "8:15"
 * @param {Date|string} datetime
 * @returns {string}
 */
export function formatFriendlyTime(datetime?: Date | string): string {
    if (datetime == null || isNaN(new Date(datetime).getTime())) {
        return ''
    }
    return moment(datetime).locale('de').format('HH:mm')
}
/**
 * Formats a date range like "Mo., 1.10.2021 08:00 – 12:00" or "Mo., 1.10.2021 08:00 – Do., 2.10.2021 08:00"
 * @param {Date} begin
 * @param {Date} end
 * @returns {string}
 */
export function formatFriendlyDateTimeRange(
    begin: Date | null,
    end: Date | null
): string {
    if (begin == null) {
        return ''
    }
    let str = formatFriendlyDate(begin) + ', ' + formatFriendlyTime(begin)
    if (end != null) {
        if (begin.toDateString() === end.toDateString()) {
            str += ' – ' + formatFriendlyTime(end)
        } else {
            str +=
                ' – ' + formatFriendlyDate(end) + ', ' + formatFriendlyTime(end)
        }
    }
    return str
}

/**
 * Formats a date and time like "Mo., 1.10.2020, 08:15"
 * @param {Date|string} datetime
 * @returns {string}
 */
export function formatFriendlyDateTime(datetime?: Date | string): string {
    if (datetime == null || isNaN(new Date(datetime).getTime())) {
        return 'No date available'
    }
    // if year is 1970, it's probably not yet available
    if (new Date(datetime).getFullYear() === 1970) {
        return t('dates.notYet')
    }
    const date = formatFriendlyDate(datetime)
    const time = formatFriendlyTime(datetime)

    return `${date}, ${time}`
}

/**
 * Formats a day like "Morgen" or "Montag, 1.10."
 * @param {Date|string} datetime
 * @returns {string}
 */
export function formatNearDate(datetime: Date | string): string {
    const date = moment(datetime)
    const today = moment()
    const tomorrow = moment().add(1, 'days')

    if (date.isSame(today, 'day')) {
        return t('dates.today')
    } else if (date.isSame(tomorrow, 'day')) {
        return t('dates.tomorrow')
    } else {
        return date.locale('de').format('dddd, D.M.')
    }
}

/**
 * Formats a time delta like "in 5 Minuten".
 * @param {number} delta Time delta in milliseconds
 * @returns {string}
 */
function formatFriendlyTimeDelta(delta: number): string {
    moment.relativeTimeThreshold('d', 13)
    moment.relativeTimeThreshold('w', 4)
    moment.locale(i18n.language)
    const duration = moment.duration(delta)
    const relative = moment().add(duration)
    return relative.fromNow()
}

/**
 * Formats a relative date and time like "in 5 Minuten" or "vor 10 Minuten"
 * @param {Date} date
 * @returns {string}
 */
export function formatFriendlyRelativeTime(date: Date): string {
    // if date is 1.1.1970, it's probably null
    if (date.getFullYear() === 1970) {
        return ''
    }

    if (isNaN(date.getTime())) {
        return ''
    }

    const deltaFromNow = moment(date).diff(moment())

    return formatFriendlyTimeDelta(deltaFromNow)
}

/**
 * Formats a relative date and time like "5 min"
 * @param {Date|string} datetime
 * @returns {string}
 */
export function formatRelativeMinutes(datetime: Date | string): string {
    if (typeof datetime === 'string') {
        datetime = new Date(datetime)
    }

    const minutes = Math.max(
        Math.floor((datetime.getTime() - Date.now()) / 60000),
        0
    )
    return `${minutes} min`
}

/**
 * Formats a date like "2020-10-01"
 * @param {Date} date
 * @returns {string}
 */
export function formatISODate(date: Date | undefined): string {
    if (date == null) {
        return ''
    }
    return (
        date.getFullYear().toString().padStart(4, '0') +
        '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        date.getDate().toString().padStart(2, '0')
    )
}

/**
 * Formats a time like "08:15"
 * @param {Date} date
 * @returns {string}
 */
export function formatISOTime(date: Date | undefined): string {
    if (date == null) {
        return ''
    }
    return (
        date.getHours().toString().padStart(2, '0') +
        ':' +
        date.getMinutes().toString().padStart(2, '0')
    )
}

/**
 * Returns the start of the week
 * https://stackoverflow.com/a/4156516
 * @param {Date} date
 * @returns {string}
 */
export function getMonday(date: Date): Date {
    date = new Date(date)
    const day = date.getDay()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - day + (day === 0 ? -6 : 1))
    return date
}

/**
 * Returns the start end the end of the week
 * @param {Date} date
 * @returns {string}
 */
export function getWeek(date: Date): [Date, Date] {
    const start = getMonday(date)
    const end = getMonday(date)
    end.setDate(end.getDate() + 7)
    return [start, end]
}

/**
 * Adds weeks to a date
 * @param {Date} date
 * @param {number} delta
 * @returns {Date}
 */
export function addWeek(date: Date, delta: number): Date {
    date = new Date(date)
    date.setDate(date.getDate() + delta * 7)
    return date
}

/**
 * Formats a date like 'Nächste Woche' or '17.5. – 23.5.'
 * @param {Date} date
 * @returns {string}
 */
export function getFriendlyWeek(date: Date, lang: string): string {
    const [currStart, currEnd] = getWeek(new Date())
    const [nextStart, nextEnd] = getWeek(addWeek(new Date(), 1))
    if (date >= currStart && date < currEnd) {
        return t('dates.thisWeek')
    } else if (date >= nextStart && date < nextEnd) {
        return t('dates.nextWeek')
    } else {
        const monday = getMonday(date)
        const sunday = new Date(monday)
        sunday.setDate(sunday.getDate() + 6)

        return (
            monday.toLocaleString(lang, {
                day: 'numeric',
                month: 'numeric',
            }) +
            ' – ' +
            sunday.toLocaleString(lang, {
                day: 'numeric',
                month: 'numeric',
            })
        )
    }
}

/**
 * Returns true if the given date is a weekend day
 * @param {Date} date
 * @returns {boolean}
 */
export function isWeekend(date: Date): boolean {
    return date.getDay() === 0 || date.getDay() === 6
}

/**
 * Returns the given day on working days or the next working day if the given date is a weekend day
 * @param {Date} date
 * @returns {Date}
 */
export function getAdjustedDay(date: Date): Date {
    if (isWeekend(date)) {
        return getMonday(addWeek(date, 1))
    }
    return date
}

/**
 * Returns true if the given dates are on the same day
 * @param {Date} a
 * @param {Date} b
 * @returns {boolean}
 **/
export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

/**
 * Combines the date from one Date object and the time from another Date object
 * @param {Date} date
 * @param {Date} time
 * @returns {Date}
 */
export function combineDateTime(date: Date, time: Date): Date {
    date = new Date(date)
    time = new Date(time)
    date.setHours(time.getHours())
    date.setMinutes(time.getMinutes())
    date.setSeconds(time.getSeconds())
    date.setMilliseconds(time.getMilliseconds())
    return date
}

export function getDateRange(startDate: Date, delta: number): Date[] {
    const dates = []
    let currentDate = startDate
    for (let i = 0; i < delta; i++) {
        dates.push(currentDate)
        currentDate = new Date(currentDate)
        currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
}

/**
 * Returns the date without the time
 * @param date
 * @returns Date with time set to 00:00:00
 * @example
 * ignoreTime(new Date('2021-01-01T12:00:00')) // => new Date('2021-01-01T00:00:00')
 */
export function ignoreTime(date: dayjs.Dayjs): dayjs.Dayjs {
    return date
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
}
