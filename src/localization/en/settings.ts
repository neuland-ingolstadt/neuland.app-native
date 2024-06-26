export default {
    menu: {
        guest: {
            title: 'Sign in',
            subtitle: 'Sign in to unlock all features of the app',
        },
        employee: {
            subtitle1: 'Employee account',
            subtitle2: 'Tap to logout',
        },
        error: {
            subtitle2: 'Pull to refresh or tap to logout',
            noData: {
                title: 'No data available',
                subtitle1: 'Looks like you are no longer enrolled.',
                subtitle2: 'Please check your Primuss account.',
            },
        },
        formlist: {
            preferences: {
                title: 'Preferences',
                theme: 'Appearance',
                food: 'Food',
                language: 'Language',
            },
            language: {
                title: 'Change language',
                message: 'Confirm to change the app language to German.',
                confirm: 'Confirm',
            },
            legal: {
                title: 'Legal',
                about: 'About',
                rate: 'Rate the app',
            },
        },
        copyright: '© {{year}} by Neuland Ingolstadt e.V.',
    },
    about: {
        header: {
            developed: 'Developed by',
        },
        formlist: {
            legal: {
                title: 'Legal',
                privacy: 'Privacy Policy',
                imprint: 'Imprint',
            },
            about: {
                title: 'About us',
            },
        },
        easterEgg: {
            title: 'Easter Egg',
            message: 'You unlocked the exclusive app icon "Paradise Cat"! 😻',
            messageAndroid: 'You found an easter egg! 🐣',
            confirm: 'Nice!',
        },
        analytics: {
            title: 'Analytics',
            toggle: 'Collect Anonymous Usage Data',
            message:
                'Help us improve the app by sending anonymous usage data. It is not possible to deduce your identity at any time.',
        },
    },
    changelog: {
        footer: 'To see the full changelog, check out the commits on ',
    },
    licenses: {
        footer: 'These libraries were used to create this app. Some are platform-specific and therefore may not be included in your build.',
    },
    profile: {
        error: {
            title: 'No data available',
            message:
                'Looks like you are no longer enrolled. Please check your Primuss account.',
            button: 'Primuss',
        },

        formlist: {
            grades: {
                title: 'Grades',
                button: 'Grades and subjects',
            },
            user: {
                title: 'User',
                matrical: 'Matriculation number',
                library: 'Library number',
                printer: 'Printer credits',
            },
            study: {
                title: 'Study',
                degree: 'Degree',
                spo: 'Exam regulations',
                group: 'Study group',
            },
            contact: {
                title: 'Contact',
                phone: 'Phone',
                street: 'Street',
                city: 'City',
            },
        },
        logout: {
            button: 'Logout',
            alert: {
                title: 'Confirm',
                message:
                    'This will log you out of the app and clear all your data.',
                cancel: 'Cancel',
                confirm: 'Logout',
            },
        },
    },
    theme: {
        accent: {
            title: 'Accent color',
        },
        exclusive: {
            title: 'Exclusive designs',
            description: 'Coming soon',
        },
        colors: {
            teal: 'Teal',
            blue: 'Blue',
            contrast: 'Contrast',
            pink: 'Pink',
            brown: 'Brown',
            purple: 'Purple',
            yellow: 'Yellow',
            orange: 'Orange',
            green: 'Neuland',
        },
        footer: 'Change the accent color to match your style. This changes the color of the icons and buttons in the app.',
    },
    dashboard: {
        shown: 'Shown cards',
        hidden: 'Hidden cards',
        reset: 'Reset order',
        noShown: 'Dashboard is empty',
        noShownDescription: 'Add some cards to your dashboard to get started.',
        noShownButton: 'Configure',
        footer: 'Customize your dashboard by dragging and dropping the cards to your preferred order. Hide cards by pressing on the remove icon.',
        unavailable: {
            title: 'Unavailable cards',
            message:
                'To use all features of the app, you need to sign in. Tap to continue with your THI account.',
        },
    },
    grades: {
        grade: 'Grade',
        none: '(none)',
        finished: 'Grades',
        open: 'Open',
        average: 'Average',
        averageError: 'Average grade is currently not available.',
        missingAverage:
            'The exact average cannot be calculated and ranges between {{min}} and {{max}}.',
        exactAverage: 'Based on {{number}} weighted grades.',
        temporarilyUnavailable: 'Grades are temporarily unavailable.',
        footer: 'This is overview is only for general information and is not legally binding. Please refer to the official grades sheet on Primuss for binding information.',
    },
    appIcon: {
        names: {
            default: 'Neuland Next',
            modernDark: 'Modern Dark',
            retro: 'neuland.app',
            modernGreen: 'Modern Green',
            modernPink: 'Modern Pink',
            rainbowMoonLight: 'Rainbow Light',
            rainbowDark: 'Rainbow Dark',
            rainbowNeon: 'Rainbow Neon',
            cat: 'Pradise Cat',
        },
        categories: {
            default: 'Default',
            neon: 'Neon',
            rainbow: 'Rainbow',
            exclusive: 'Exclusive',
        },
        exclusive:
            'Attend to our events and find easter eggs to unlock exclusive app icons.',
    },
}
