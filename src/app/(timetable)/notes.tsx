import { type Colors } from '@/stores/colors'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, ScrollView } from 'react-native'
import WebView from 'react-native-webview'
import sanitizeHtml from 'sanitize-html'

const PADDING = 12

export default function NotesDetails(): JSX.Element {
    const navigation = useNavigation()
    const windowWidth = Dimensions.get('window').width
    const windowHeight = Dimensions.get('window').height

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

    useEffect(() => {
        navigation.setOptions({
            title: title ?? t('details.title'),
        })
    }, [navigation])

    return (
        <>
            <StatusBar style={getStatusBarStyle()} />
            <ScrollView>
                <WebView
                    style={{
                        height: windowHeight - 200,
                        width: windowWidth - PADDING * 2,
                        backgroundColor: colors.background,
                        color: colors.text,
                        padding: PADDING,
                        alignSelf: 'center',
                    }}
                    originWhitelist={['*']}
                    source={{ html: styledHtml }}
                    scalesPageToFit
                />
            </ScrollView>
        </>
    )
}
