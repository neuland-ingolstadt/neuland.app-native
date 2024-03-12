export default {
    empty: {
        allergens: 'Keine passenden Allergene gefunden.',
        noAllergens: 'Allergene nicht verfügbar',
        flags: 'Keine passenden Vorlieben gefunden.',
        config: 'Keine Allergene festgelegt. Tippe hier zum Konfigurieren deiner Allergien, um nicht verbindliche Informationen über Allergene anzuzeigen.',
    },
    preferences: {
        formlist: {
            allergens: 'Allergene',
            flags: 'Vorlieben',
            static: 'Dauerhafte Gerichte',
            language: 'Essenssprache',
        },
        footer: 'Wir übernehmen keine Verantwortung für die Korrektheit und Genauigkeit der Daten. Bitte überprüfe die Daten im Restaurant vor dem Verzehr. Du kannst auch die Datenquelle jeder Mahlzeit in der Detailansicht überprüfen.',
        languages: {
            de: 'Deutsch',
            en: 'Englisch',
            auto: 'Default',
        },
    },
    price: {
        guests: 'für Gäste',
        students: 'für Studierende',
        employees: 'für Mitarbeitende',
        unknown: 'nicht verfügbar',
    },
    dashboard: {
        oneMore: 'und eine weitere Mahlzeit',
        manyMore: 'und {{count}} weitere Gerichte',
        empty: 'Der Speiseplan für heute ist leer.',
    },
    categories: {
        soup: 'Suppe',
        salad: 'Salat',
        main: 'Essen',
        special: 'Aktion',
    },
    details: {
        footer: 'Wir übernehmen keine Verantwortung für die Korrektheit der Daten. Bitte überprüfe die Richtigkeit der Daten mit dem jeweiligen Restaurant, bevor du etwas zu dir nimmst.',
        translated: 'Dieses Gericht wurde automatisch übersetzt. ',

        formlist: {
            prices: {
                title: 'Preise',
                student: 'Student',
                employee: 'Mitarbeiter',
                guest: 'Gast',
            },
            nutrition: {
                title: 'Ernährung',
                footer: 'Werte gelten pro Mahlzeit und können variieren.',
                energy: 'Energie',
                fat: 'Fett',
                saturated: 'Gesättigte Fettsäuren',
                carbs: 'Kohlenhydrate',
                sugar: 'Zucker',
                fiber: 'Ballaststoffe',
                protein: 'Protein',
                salt: 'Salz',
            },
            about: {
                title: 'Über',
                category: 'Kategorie',
                source: 'Datenquelle',
            },
            variants: 'Varianten',
            alert: {
                allergen: {
                    title: 'Allergene aktualisieren',
                    message: {
                        add: 'Möchtest du {{allergen}} zu deinen Allergenen hinzufügen?',
                        remove: 'Möchtest du {{allergen}} von deinen Allergenen entfernen?',
                    },
                },
                flag: {
                    title: 'Einstellungen aktualisieren',
                    message: {
                        add: 'Möchtest du {{flag}} zu deinen Vorlieben hinzufügen?',
                        remove: 'Möchtest du {{flag}} von deinen Vorlieben entfernen?',
                    },
                },
            },
        },
        share: {
            message:
                'Schau dir "{{meal}}" ({{price}}) bei {{location}} an.\nhttps://dev.neuland.app/food/{{id}}',
        },
    },
}
