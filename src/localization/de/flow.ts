export default {
    whatsnew: {
        title: 'Was ist neu?',
        version: 'in Version {{version}}',
        continue: 'Weiter',
    },
    onboarding: {
        links: {
            privacy: 'Datenschutz',
            privacypolicy: 'Datenschutzerklärung',
            agree1: 'Durch Fortfahren stimmst du unserer ',
            agree2: ' zu.',
            imprint: 'Impressum',
        },
        page1: {
            title: 'Willkommen bei\nNeuland Next',
            subtitle: 'Wische, um mehr zu erfahren',
        },
        page2: {
            title: 'Alles an einem Ort',
            text:
                `Neuland Next vereint alle wichtigen Informationen über dein Studium in einer App.\n\n` +
                `Passe dein Dashboard nach deinen Bedürfnissen an und erhalte einen schnellen Überblick über deinen Stundenplan, Noten und mehr.\n\n` +
                `Die interaktive Karte zeigt dir alle wichtigen Orte auf dem Campus.`,
        },
        page3: {
            title: 'Datensicherheit',
            text:
                `Neuland Next ist ein Open-Source-Projekt und wird von Studenten für Studenten entwickelt.\n\n` +
                `Als Alternative zur offiziellen THI-App schützen wir deine Daten streng. ` +
                `Um deine persönlichen Daten abzurufen, verwenden wir die offizielle und verschlüsselte API der THI.\n\n` +
                `Dein Passwort und deine Daten sind daher weder für uns noch für Dritte zugänglich.`,
        },
        navigation: {
            next: 'Weiter',
            skip: 'Überspringen',
        },
    },
    login: {
        title: 'Anmelden mit THI-Account',
        toast: 'Anmeldung erfolgreich',
        alert: {
            error: {
                title: 'Anmeldung fehlgeschlagen',
                wrongCredentials: 'Deine Anmeldedaten sind falsch.',
                missing: 'Bitte fülle alle Felder aus.',
                generic:
                    'Beim Verbinden mit dem Server ist ein Fehler aufgetreten.',
                backend:
                    'Das THI-Backend ist derzeit nicht verfügbar. Bitte versuche es später erneut.',
                noConnection: 'Netzwerkanfrage fehlgeschlagen',
            },
            restored: {
                title: 'Anmeldedaten wiederhergestellt',
                message:
                    'Frühere Anmeldedaten wurden im iOS-Schlüsselbund gefunden.',
            },
        },
        username: 'THI-Benutzername',
        password: 'Passwort',
        button: 'Anmelden',
        guest: 'oder als Gast fortfahren',
    },
}
