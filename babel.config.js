module.exports = function (api) {
    api.cache(true)
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'expo-router/babel',
            'react-native-reanimated/plugin',
            [
                'formatjs',
                {
                    idInterpolationPattern: '[sha512:contenthash:base64:6]',
                    ast: true,
                },
            ],
        ],
    }
}
