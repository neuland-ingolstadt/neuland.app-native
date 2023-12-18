export default {
    toast: {
        clipboard: 'in Zwischenablage kopiert',
    },
    error: {
        title: 'Ein Fehler ist aufgetreten',
        description: 'Ziehe zum Aktualisieren nach unten.',
        refreshPull:
            'Ein Fehler ist beim Laden der Daten aufgetreten.\nZiehe zum Aktualisieren nach unten.',
        refreshButton:
            'Ein Fehler ist beim Laden der Daten aufgetreten.\nKlicke zum Aktualisieren.',
        button: 'Erneut versuchen',
        noSession: 'Nicht angemeldet.',
    },

    dates: {
        until: 'bis',
        notYet: 'Termin noch nicht bekannt',
        ends: 'endet',
        today: 'Heute',
        tomorrow: 'Morgen',
        thisWeek: 'Diese Woche',
        nextWeek: 'Nächste Woche',
    },
    misc: {
        share: 'Teilen',
        cancel: 'Abbrechen',
        confirm: 'Bestätigen',
        delete: 'Löschen',
        disable: 'Deaktivieren',
    },
    pages: {
        calendar: {
            exams: {
                title: 'Prüfungen',
                error: 'Kein Studierender',
                errorSubtitle: 'Melde dich an, um deine Prüfungen zu sehen.',
            },
            calendar: {
                link: 'https://www.thi.de/studium/pruefung/semestertermine/',
                noData: {
                    title: 'Keine Daten gefunden',
                    subtitle: 'Bitte versuche es später erneut.',
                },
            },
            footer: {
                part1: 'Alle Informationen ohne Gewähr. Verbindliche Informationen sind direkt verfügbar auf der ',
                part2: 'Universitätswebsite',
            },
        },
        lecturers: {
            results: 'Suchergebnisse',
            personal: 'Persönliche Dozenten',
        },
        lecturer: {
            details: {
                title: 'Titel',
                organization: 'Organisation',
                function: 'Funktion',
            },
            contact: {
                room: 'Raum',
                title: 'Kontakt',
                phone: 'Telefon',
                office: 'Sprechstunde',
                exam: 'Einsichtnahme',
            },
        },
        exam: {
            details: {
                date: 'Datum',
                room: 'Raum',
                seat: 'Platz',
                tools: 'Hilfsmittel',
            },
            about: {
                title: 'Über',
                type: 'Art',
                examiner: 'Prüfer:in',
                registration: 'Angemeldet',
                notes: 'Notizen',
            },
        },
        map: {
            search: 'Suche nach G, W003, Toilette ...',
            gf: 'EG',
        },
        rooms: {
            options: {
                title: 'Such Optionen',
                building: 'Gebäude',
                date: 'Datum',
                time: 'Zeit',
                duration: 'Dauer',
                seats: 'Plätze',
            },
            results: 'Verfügbare Räume',
        },
        library: {
            reservations: {
                title: 'Reservierungen',
                seat: 'Platz',
                id: 'Reservierungsnummer',
                alert: {
                    title: 'Reservierung löschen',
                    message: 'Möchtest du diese Reservierung wirklich löschen?',
                },
            },
            available: {
                title: 'Verfügbare Plätze',
                reserve: 'Reservieren',
                seatsAvailable: '{{available}} / {{total}} verfügbar',
                ratelimit: 'Du kannst keine weiteren Plätze reservieren.',
                noSeats: 'Keine weiteren Plätze verfügbar.',
                footer: 'Bis zu 5 aktive Reservierungen innerhalb von sieben Tagen erlaubt. Stornierung ist vor Beginn der Reservierung möglich.',
                book: 'Platz buchen',
                room: 'Raum',
            },
            code: {
                number: 'Nummer',
                footer: 'Verwende diesen Barcode zum anmelden an den Bibliotheksterminals, um Bücher auszuleihen.',
            },
        },
    },
}
