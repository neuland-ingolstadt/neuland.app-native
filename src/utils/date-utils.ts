const WORD_TODAY = 'Heute'
const WORD_TOMORROW = 'Morgen'
export const WORD_THIS_WEEK = 'Diese Woche'
export const WORD_NEXT_WEEK = 'Nächste Woche'

export const DATE_LOCALE = 'de-DE'

/**
 * Formats a date like "Mo., 1.10.2020"
 * @param {Date|string} datetime
 * @returns {string}
 */
export function formatFriendlyDate(datetime: Date | string): string {
    if (typeof datetime === 'string') {
        datetime = new Date(datetime)
    }

    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (datetime.toDateString() === today.toDateString()) {
        return WORD_TODAY
    } else if (datetime.toDateString() === tomorrow.toDateString()) {
        return WORD_TOMORROW
    } else {
        return datetime.toLocaleString(DATE_LOCALE, {
            weekday: 'short',
            day: 'numeric',
            month: '2-digit',
            year: 'numeric',
        })
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
export function formatFriendlyTime(datetime: Date | string): string {
    if (typeof datetime === 'string') {
        datetime = new Date(datetime)
    }

    return datetime.toLocaleTimeString(DATE_LOCALE, {
        hour: 'numeric',
        minute: '2-digit',
    })
}

/**
 * Formats a date range like "Mo., 1.10.2021 08:00 – 12:00" or "Mo., 1.10.2021 08:00 – Do., 2.10.2021 08:00"
 * @param {Date} begin
 * @param {Date} end
 * @returns {string}
 */
export function formatFriendlyDateTimeRange(begin: Date, end?: Date): string {
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
export function formatFriendlyDateTime(datetime: Date | string): string {
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
    if (typeof datetime === 'string') {
        datetime = new Date(datetime)
    }

    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (datetime.toDateString() === today.toDateString()) {
        return WORD_TODAY
    } else if (datetime.toDateString() === tomorrow.toDateString()) {
        return WORD_TOMORROW
    } else {
        return datetime.toLocaleString(DATE_LOCALE, {
            weekday: 'long',
            day: 'numeric',
            month: 'numeric',
        })
    }
}

/**
 * Formats a time delta like "in 5 Minuten".
 * @param {number} delta Time delta in milliseconds
 * @returns {string}
 */
function formatFriendlyTimeDelta(delta: number): string {
    const rtl = new Intl.RelativeTimeFormat(DATE_LOCALE, {
        numeric: 'auto',
        style: 'long',
    })

    const weeks = (delta / (7 * 24 * 60 * 60 * 1000)) | 0
    if (Math.abs(weeks) > 0) {
        return rtl.format(weeks, 'week')
    }

    const days = (delta / (24 * 60 * 60 * 1000)) | 0
    if (Math.abs(days) > 0) {
        return rtl.format(days, 'day')
    }

    const hours = (delta / (60 * 60 * 1000)) | 0
    if (Math.abs(hours) > 0) {
        return rtl.format(hours, 'hour')
    }

    const minutes = (delta / (60 * 1000)) | 0
    return rtl.format(minutes, 'minute')
}

/**
 * Formats a relative date and time like "in 5 Minuten" or "vor 10 Minuten"
 * @param {Date} date
 * @returns {string}
 */
export function formatFriendlyRelativeTime(date: Date): string {
    const startOfDay = new Date()
    startOfDay.setHours(0)
    startOfDay.setMinutes(0)
    startOfDay.setSeconds(0)
    startOfDay.setMilliseconds(0)

    const deltaFromNow = date.getTime() - Date.now()
    const deltaFromStartOfDay = date.getTime() - startOfDay.getTime()

    // when the event is more than 24h away, use the start of the day as a reference
    // (because that is how humans measure time, apparently)
    if (Math.abs(deltaFromNow) < 86400000) {
        return formatFriendlyTimeDelta(deltaFromNow)
    } else if (deltaFromNow > 0) {
        return formatFriendlyTimeDelta(deltaFromStartOfDay)
    } else {
        return formatFriendlyTimeDelta(deltaFromStartOfDay - 86400000)
    }
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
export function formatISODate(date: Date): string {
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
export function formatISOTime(date: Date): string {
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
export function getFriendlyWeek(date: Date): string {
    const [currStart, currEnd] = getWeek(new Date())
    const [nextStart, nextEnd] = getWeek(addWeek(new Date(), 1))
    if (date >= currStart && date < currEnd) {
        return WORD_THIS_WEEK
    } else if (date >= nextStart && date < nextEnd) {
        return WORD_NEXT_WEEK
    } else {
        const monday = getMonday(date)
        const sunday = new Date(monday)
        sunday.setDate(sunday.getDate() + 6)

        return (
            monday.toLocaleString(DATE_LOCALE, {
                day: 'numeric',
                month: 'numeric',
            }) +
            ' – ' +
            sunday.toLocaleString(DATE_LOCALE, {
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
