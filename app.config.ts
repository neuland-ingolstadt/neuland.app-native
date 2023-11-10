import packageInfo from './package.json'

module.exports = {
    expo: {
        name: 'Neuland Next',
        slug: 'neuland-app-native',
        scheme: 'neuland',
        owner: 'neuland-ingolstadt',
        version: packageInfo.version,
        githubUrl: 'https://github.com/neuland-ingolstadt/neuland.app-native/',
        orientation: 'portrait',
        userInterfaceStyle: 'automatic',
        icon: './src/assets/icon.png',
        splash: {
            image: './src/assets/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
        },
        ios: {
            bundleIdentifier: 'de.neuland-ingolstadt.neuland-app',
            buildNumber: '1',
            supportsTablet: true,
            userInterfaceStyle: 'automatic',
            associatedDomains: [
                'webcredentials:neuland.app',
                'activitycontinuation:neuland.app',
            ],
            config: {
                usesNonExemptEncryption: false,
            },
            infoPlist: {
                RCTAsyncStorageExcludeFromBackup: false,
                CFBundleAllowMixedLocalizations: true,
                CFBundleLocalizations: ['en', 'de'],
                CFBundleDevelopmentRegion: 'en',
            },
        },
        android: {
            package: 'app.neuland',
            userInterfaceStyle: 'automatic',
            versionCode: 40,
        },
        extra: {
            eas: {
                projectId: 'b0ef9e3f-3115-44b0-abc7-99dd75821353',
            },
        },
        runtimeVersion: {
            policy: 'sdkVersion',
        },
        updates: {
            url: 'https://u.expo.dev/b0ef9e3f-3115-44b0-abc7-99dd75821353',
        },
        sdkVersion: '49.0.0',
        experiments: {
            tsconfigPaths: true,
        },
        plugins: [
            [
                'expo-router',
                {
                    origin: 'https://neuland.app',
                },
            ],
            ['expo-localization'],
        ],
    },
}
