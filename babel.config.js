/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-undef */
module.exports = function (api) {
    api.cache(true)
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['react-native-reanimated/plugin'],
            [
                'transform-inline-environment-variables',
                {
                    include: [
                        'EXPO_PUBLIC_THI_API_KEY',
                        'EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT',
                        'EXPO_PUBLIC_APTABASE_KEY',
                    ],
                },
            ],
        ],
    }
}
