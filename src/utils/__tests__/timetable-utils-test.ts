import type {
    CalendarEvent,
    Exam,
    FriendlyTimetableEntry,
    TimetableSections,
} from '@/types/utils'
import moment from 'moment'

import {
    convertTimetableToWeekViewEvents,
    generateKey,
    getGroupedTimetable,
    isValidRoom,
} from '../timetable-utils'

describe('getGroupedTimetable', () => {
    it('should correctly group and sort timetable entries and exams by date', () => {
        const timetable: FriendlyTimetableEntry[] = [
            {
                date: new Date('2023-10-01T10:00:00Z'),
                startDate: new Date('2023-10-01T10:00:00Z'),
                endDate: new Date('2023-10-01T11:00:00Z'),
                name: 'Lecture 1',
                shortName: 'Lec 1',
                rooms: ['Room 1'],
                lecturer: 'Dr. Smith',
                course: 'Course 1',
                studyGroup: 'Group 1',
                sws: '2',
                ects: '3',
                goal: 'Goal 1',
                contents: 'Contents 1',
                literature: 'Literature 1',
            },
            {
                date: new Date('2023-10-02T12:00:00Z'),
                startDate: new Date('2023-10-02T12:00:00Z'),
                endDate: new Date('2023-10-02T13:00:00Z'),
                name: 'Lecture 2',
                shortName: 'Lec 2',
                rooms: ['Room 2'],
                lecturer: 'Dr. Johnson',
                course: 'Course 2',
                studyGroup: 'Group 2',
                sws: '2',
                ects: '3',
                goal: 'Goal 2',
                contents: 'Contents 2',
                literature: 'Literature 2',
            },
        ]

        const exams: Exam[] = [
            {
                date: new Date('2023-10-01T08:00:00Z'),
                type: 'LN - schriftliche Prüfung, 90 Minuten',
                name: 'Exam 1',
                rooms: 'Room 3',
                seat: 'Seat 1',
                notes: 'Notes 1',
                examiners: ['Examiner 1'],
                enrollment: new Date('2023-09-01T08:00:00Z'),
                aids: ['Aid 1'],
            },
            {
                date: new Date('2023-10-02T09:00:00Z'),
                type: 'SP - schrP90 - schriftliche Prüfung, 90 Minuten',
                name: 'Exam 2',
                rooms: 'Room 4',
                seat: 'Seat 2',
                notes: 'Notes 2',
                examiners: ['Examiner 2'],
                enrollment: new Date('2023-09-02T09:00:00Z'),
                aids: ['Aid 2'],
            },
        ]

        const expectedOutput: TimetableSections[] = [
            {
                title: new Date('2023-10-01'),
                data: [
                    {
                        date: new Date('2023-10-01T08:00:00Z'),
                        type: 'LN - schriftliche Prüfung, 90 Minuten',
                        name: 'Exam 1',
                        rooms: 'Room 3',
                        seat: 'Seat 1',
                        notes: 'Notes 1',
                        examiners: ['Examiner 1'],
                        enrollment: new Date('2023-09-01T08:00:00Z'),
                        aids: ['Aid 1'],
                        endDate: moment('2023-10-01T08:00:00Z')
                            .add(90, 'minutes')
                            .toDate(),
                        eventType: 'exam',
                    },
                    {
                        date: new Date('2023-10-01T10:00:00Z'),
                        startDate: new Date('2023-10-01T10:00:00Z'),
                        endDate: new Date('2023-10-01T11:00:00Z'),
                        name: 'Lecture 1',
                        shortName: 'Lec 1',
                        rooms: ['Room 1'],
                        lecturer: 'Dr. Smith',
                        course: 'Course 1',
                        studyGroup: 'Group 1',
                        sws: '2',
                        ects: '3',
                        goal: 'Goal 1',
                        contents: 'Contents 1',
                        literature: 'Literature 1',
                        eventType: 'timetable',
                    },
                ],
            },
            {
                title: new Date('2023-10-02'),
                data: [
                    {
                        date: new Date('2023-10-02T09:00:00Z'),
                        type: 'SP - schrP90 - schriftliche Prüfung, 90 Minuten',
                        name: 'Exam 2',
                        rooms: 'Room 4',
                        seat: 'Seat 2',
                        notes: 'Notes 2',
                        examiners: ['Examiner 2'],
                        enrollment: new Date('2023-09-02T09:00:00Z'),
                        aids: ['Aid 2'],
                        endDate: moment('2023-10-02T09:00:00Z')
                            .add(90, 'minutes')
                            .toDate(),
                        eventType: 'exam',
                    },
                    {
                        date: new Date('2023-10-02T12:00:00Z'),
                        startDate: new Date('2023-10-02T12:00:00Z'),
                        endDate: new Date('2023-10-02T13:00:00Z'),
                        name: 'Lecture 2',
                        shortName: 'Lec 2',
                        rooms: ['Room 2'],
                        lecturer: 'Dr. Johnson',
                        course: 'Course 2',
                        studyGroup: 'Group 2',
                        sws: '2',
                        ects: '3',
                        goal: 'Goal 2',
                        contents: 'Contents 2',
                        literature: 'Literature 2',
                        eventType: 'timetable',
                    },
                ],
            },
        ]

        const result = getGroupedTimetable(timetable, exams)
        expect(result).toEqual(expectedOutput)
    })
})

describe('generateKey', () => {
    it('should generate a unique key for a lecture', () => {
        const lectureName = 'Lecture 1'
        const startDate = new Date('2023-10-01T10:00:00Z')
        const room = 'Room 1'
        const expectedKey = 'Lecture 1-1696154400000-Room 1'
        const result = generateKey(lectureName, startDate, room)
        expect(result).toBe(expectedKey)
    })
})

describe('isValidRoom', () => {
    it('should return true for valid room strings', () => {
        expect(isValidRoom('A101')).toBe(true)
        expect(isValidRoom('B202')).toBe(true)
        expect(isValidRoom('C303')).toBe(true)
        expect(isValidRoom('AU101')).toBe(true)
        expect(isValidRoom('BU202')).toBe(true)
        expect(isValidRoom('A32')).toBe(true)
    })

    it('should return false for invalid room strings', () => {
        expect(isValidRoom('101')).toBe(false)
        expect(isValidRoom('Online')).toBe(false)
        expect(isValidRoom('Campuswiese')).toBe(false)
        expect(isValidRoom('AB1234')).toBe(false)
        expect(isValidRoom('A1U01')).toBe(false)
        expect(isValidRoom('')).toBe(false)
    })
})

describe('convertTimetableToWeekViewEvents', () => {
    it('should convert timetable entries to calendar events', () => {
        const entries: FriendlyTimetableEntry[] = [
            {
                date: new Date('2023-10-01T10:00:00Z'),
                startDate: new Date('2023-10-01T10:00:00Z'),
                endDate: new Date('2023-10-01T11:00:00Z'),
                name: 'Lecture 1',
                shortName: 'Lec 1',
                rooms: ['Room 1'],
                lecturer: 'Dr. Smith',
                course: 'Course 1',
                studyGroup: 'Group 1',
                sws: '2',
                ects: '3',
                goal: 'Goal 1',
                contents: 'Contents 1',
                literature: 'Literature 1',
            },
            {
                date: new Date('2023-10-02T12:00:00Z'),
                startDate: new Date('2023-10-02T12:00:00Z'),
                endDate: new Date('2023-10-02T13:00:00Z'),
                name: 'Lecture 2',
                shortName: 'Lec 2',
                rooms: ['Room 2'],
                lecturer: 'Dr. Johnson',
                course: 'Course 2',
                studyGroup: 'Group 2',
                sws: '2',
                ects: '3',
                goal: 'Goal 2',
                contents: 'Contents 2',
                literature: 'Literature 2',
            },
        ]

        const color = 'blue'
        const textColor = 'white'

        const expectedOutput: CalendarEvent[] = [
            {
                start: entries[0].startDate,
                end: entries[0].endDate,
                title: entries[0].shortName,
                color,
                textColor,
                location: 'Room 1',
                entry: entries[0],
            },
            {
                start: entries[1].startDate,
                end: entries[1].endDate,
                title: entries[1].shortName,
                color,
                textColor,
                location: 'Room 2',
                entry: entries[1],
            },
        ]

        const result = convertTimetableToWeekViewEvents(
            entries,
            color,
            textColor
        )
        expect(result).toEqual(expectedOutput)
    })
})
