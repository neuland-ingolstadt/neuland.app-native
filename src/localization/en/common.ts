export default {
    toast: {
        clipboard: 'copied to clipboard',
    },
    error: {
        title: 'An error occurred',
        description: 'Pull down to refresh.',
        refreshPull:
            'An error occurred while loading the data.\nPull down to refresh.',
        refreshButton:
            'An error occurred while loading the data.\nClick to refresh.',
        button: 'Retry',
        noSession: 'Not signed in.',
    },
    dates: {
        until: 'until',
        ends: 'ends',
        today: 'Today',
        notYet: 'Date not yet available',
        tomorrow: 'Tomorrow',
        thisWeek: 'This Week',
        nextWeek: 'Next Week',
    },
    misc: {
        share: 'Share',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        disable: 'Disable',
    },
    pages: {
        calendar: {
            exams: {
                title: 'Exams',
                error: 'Not a student',
                errorSubtitle: 'Sign in to see your exams.',
            },
            calendar: {
                link: 'https://www.thi.de/en/international/studies/examination/semester-dates/',
                noData: {
                    title: 'No data found',
                    subtitle: 'Please try again later.',
                },
            },
            footer: {
                part1: 'All information without guarantee. Binding information is only available directly on the ',
                part2: 'university website',
            },
        },
        lecturers: {
            results: 'Search results',
            personal: 'Personal lecturers',
        },
        lecturer: {
            details: {
                title: 'Title',
                organization: 'Organization',
                function: 'Function',
            },
            contact: {
                room: 'Room',
                title: 'Contact',
                phone: 'Phone',
                office: 'Office hours',
                exam: 'Exam insights',
            },
        },
        exam: {
            details: {
                date: 'Date',
                room: 'Room',
                seat: 'Seat',
                tools: 'Tools',
            },
            about: {
                title: 'About',
                type: 'Type',
                examiner: 'Examiner',
                registration: 'Registered',
                notes: 'Notes',
            },
        },
        map: {
            search: 'Search for: G, W003, Toilette, ...',
            gf: 'GF',
        },
        rooms: {
            options: {
                title: 'Search options',
                building: 'Building',
                date: 'Date',
                time: 'Time',
                duration: 'Duration',
                seats: 'seats',
            },
            results: 'Available rooms',
        },
        library: {
            reservations: {
                title: 'Reservations',
                seat: 'Seat',
                id: 'Reservation code',
                alert: {
                    title: 'Delete reservation',
                    message: 'Do you really want to delete this reservation?',
                },
            },
            available: {
                title: 'Available seats',
                reserve: 'Reserve',
                seatsAvailable: '{{available}} / {{total}} available',
                ratelimit: 'You can not reserve more seats.',
                noSeats: 'No more seats available.',
                footer: 'Up to 5 active reservations are allowed per seven days. Cancelation is possible before the reservation starts.',
                book: 'Book seat',
                room: 'Room',
            },
            code: {
                number: 'Number',
                footer: 'Use this barcode to sign in at the library terminals to borrow books.',
            },
        },
    },
    notification: {
        permission: {
            title: 'Notifications',
            description: 'Open the system settings to enable notifications.',
            button: 'Settings',
        },
    },
}
