export default {
    whatsnew: {
        title: "What's new?",
        version: 'in version {{version}}',
        continue: 'Continue',
    },
    onboarding: {
        links: {
            privacy: 'Privacy Policy',
            imprint: 'Imprint',
        },
        page1: {
            title: 'Welcome to\nNeuland Next',
            subtitle: ' Swipe to learn more',
        },
        page2: {
            title: 'Everything in one place',
            text:
                `Neuland Next combines all important information about your studies in one app.\n\n` +
                `Customize your dashboard to your needs and get a quick overview of your schedule, grades, and more.\n\n` +
                `The interactive map shows you all important locations on campus.`,
        },
        page3: {
            title: 'Data Security',
            text:
                `Neuland Next is an open source project and developed by students for students.\n\n` +
                `As an alternative to the official THI app, we strictly protect your data. ` +
                `The app only uses the official and encrypted API provided by the THI.\n\n` +
                `Your password and data is therefore never accessible to us or third parties.`,
        },
        navigation: {
            next: 'Next',
            skip: 'Skip',
        },
    },
    login: {
        title: 'Sign in with your THI account',
        toast: 'Login successful',
        alert: {
            error: {
                title: 'Login failed',
                wrongCredentials: 'Your login credentials are incorrect.',
                generic: 'An error occurred while connecting to the server.',
                backend:
                    'The THI backend is currently unavailable. Please try again later.',
                noConnection: 'Network request failed',
            },
            restored: {
                title: 'Credentials restored',
                message: 'Previous login data was found in the iOS keychain.',
            },
        },
        username: 'THI Username',
        password: 'Password',
        button: 'Sign In',
        guest: 'or continue as guest',
    },
}
