import { type Colors } from '@/components/colors'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Platform, StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'
import sanitizeHtml from 'sanitize-html'

const PADDING = 12

export default function NotesDetails(): JSX.Element {
    const [isLoaded, setIsLoaded] = React.useState(false)

    const navigation = useNavigation()
    const windowWidth = Dimensions.get('window').width

    const colors = useTheme().colors as Colors
    const { title, html } = useLocalSearchParams<{
        title: string
        html: string
    }>()

    const { t } = useTranslation('timetable')

    const sanitizedHtml = sanitizeHtml(html ?? '')
    const styledHtml = `
    <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <style>
    body {
        padding-top: ${PADDING}px;
        color: ${colors.text};
        background-color: ${colors.background};
        font-family: --apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 14px;
    }
    </style>
    ${sanitizedHtml}`

    useLayoutEffect(() => {
        navigation.setOptions({
            title: title ?? t('details.title'),
        })
    }, [navigation])

    async function setDelayedIsLoaded(): Promise<void> {
        const delay = Platform.OS === 'ios' ? 100 : 0

        await new Promise((resolve) => setTimeout(resolve, delay))
        setIsLoaded(true)
    }

    return (
        <>
            <StatusBar style={getStatusBarStyle()} />
            <WebView
                onLoadEnd={() => {
                    void setDelayedIsLoaded()
                }}
                style={{
                    ...styles.webView,
                    width: windowWidth - PADDING * 2,
                    backgroundColor: colors.background,
                    color: colors.text,
                }}
                originWhitelist={['*']}
                source={{ html: styledHtml }}
                scalesPageToFit
            />

            {/* prevent flickering on load on iOS */}
            {isLoaded ? null : (
                <View
                    style={{
                        ...styles.iosContainer,
                        backgroundColor: colors.background,
                    }}
                />
            )}
        </>
    )
}

const styles = StyleSheet.create({
    webView: {
        height: '100%',
        padding: PADDING,
        alignSelf: 'center',
    },
    iosContainer: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        justifyContent: 'center',
    },
})
