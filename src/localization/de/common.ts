export default {
    toast: {
        clipboard: 'in Zwischenablage kopiert',
        paused: 'Keine Internetverbindung',
        roomNotFound: 'Raum nicht gefunden',
        mapOverlay: 'Fehler beim Laden des Overlays',
    },
    error: {
        title: 'Ein Fehler ist aufgetreten',
        description: 'Beim Laden der Daten ist ein Fehler aufgetreten.',
        refreshPull:
            'Ein Fehler ist beim Laden der Daten aufgetreten.\nZiehe zum Aktualisieren nach unten.',
        button: 'Erneut versuchen',
        noSession: 'Nicht angemeldet.',
        pull: 'Ziehe zum Aktualisieren nach unten',
        network: {
            title: 'Keine Internetverbindung',
            description: 'Bitte überprüfe deine Internetverbindung.',
        },
        guest: {
            title: 'Anmeldung erforderlich',
            description:
                'Um diese Funktion zu nutzen, musst du dich mit deinem THI Account anmelden.',
            button: 'Anmelden',
        },
        permission: {
            title: 'Funktion nicht verfügbar',
            description:
                'Diese Funktion ist für deine Benutzergruppe nicht verfügbar.',
        },
        map: {
            mapLoadError: 'Fehler beim Laden der Karte',
            mapOverlay: 'Fehler beim Laden des Overlays',
        },
        noMeals: 'Keine Gerichte verfügbar',
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
        more: 'mehr',
        unknown: 'Unbekannt',
    },
    pages: {
        calendar: {
            exams: {
                title: 'Prüfungen',
                error: 'Kein Studierender',
                errorSubtitle: 'Melde dich an, um deine Prüfungen zu sehen.',
                noExams: {
                    title: 'Keine Prüfungen gefunden',
                    subtitle:
                        'Nach der Anmeldung zu Prüfungen werden sie hier angezeigt.',
                },
            },
            calendar: {
                link: 'https://www.thi.de/studium/pruefung/semestertermine/',
                noData: {
                    title: 'Keine Daten gefunden',
                    subtitle: 'Bitte versuche es später erneut.',
                },
            },
            footer: {
                part1: 'Alle Informationen ohne Gewähr. Verbindliche Informationen sind direkt auf der ',
                part2: 'Universitätswebsite',
                part3: ' verfügbar.',
            },
        },
        lecturers: {
            results: 'Suchergebnisse',
            personal: 'Persönliche',
            faculty: 'Fakultät',
            professors: 'Professoren',
            error: {
                title: 'Keine Dozenten gefunden',
                subtitle:
                    'Konfiguriere deinen Stundenplan, um die persönlichen Dozenten anzuzeigen.',
            },
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
        event: {
            date: 'Datum',
            location: 'Ort',
            organizer: 'Veranstalter',
            description: 'Beschreibung',
            begin: 'Beginn',
            end: 'Ende',
            shareMessage:
                'Schau dir dieses Event an: {{title}} von {{organizer}} um {{date}}\nhttps://neuland.app/events',
        },
        map: {
            search: {
                placeholder: 'Suche nach Räumen, Gebäuden, ...',
                recent: 'Kürzlich gesucht',
                clear: 'Verlauf löschen',
                noResults: 'Keine Suchergebnisse',
                results: 'Suchergebnisse',
                fuzzy: 'Vorschläge',
            },

            easterEgg: {
                title: 'Easter Egg',
                message:
                    'Du hast das exklusive retro App-Icon "neuland.app" freigeschaltet!',
                confirm: 'Nice!',
            },
            noAvailableRooms: 'Keine freien Räume verfügbar',
            details: {
                room: {
                    details: 'Raumdetails',
                    title: 'Raum',
                    capacity: 'Kapazität',
                    availability: 'Verfügbarkeit',
                    timeLeft: 'Verbleibende Zeit',
                    building: 'Gebäude',
                    timeSpan: 'Zeitspanne',
                    floor: 'Etage',
                    type: 'Typ',
                    available: 'Verfügbar',
                    notAvailable: 'Nicht verfügbar',
                    availableRooms: 'Verfügbare Räume',
                    nextLecture: 'Nächste Vorlesung',
                    availableRoomsTitle: 'Verfügbare Räume',
                    availableRoomsSubtitle: 'Räume mit verfügbaren Plätzen',
                    signIn: 'Melden Sie sich an, um verfügbare Räume zu sehen',
                },
                building: {
                    free: 'Freie Räume',
                    total: 'Räume insgesamt',
                    floors: 'Etagen',
                },
                location: {
                    title: 'Standort',
                    alert: 'Um deinen aktuellen Standort anzuzeigen, musst du die Standortberechtigung aktivieren.',
                    button: 'Einstellungen',
                },
                osm: 'Karten Daten von OpenStreetMap',
            },
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
    notification: {
        permission: {
            title: 'Benachrichtigungen',
            description:
                'Öffne die System-Einstellungen, um Benachrichtigungen zu aktivieren.',
            button: 'Einstellungen',
        },
    },
}
