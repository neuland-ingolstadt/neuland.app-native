import { useNavigation } from 'expo-router'
import type React from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import WebView from 'react-native-webview'
import sanitizeHtml from 'sanitize-html'
import { useCSSVariable } from 'uniwind'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { toColor } from '@/utils/uniwind-utils'

const PADDING = 16
const LOADING_TIMEOUT = 100
const BOTTOM_PADDING = 80

export default function NotesDetails(): React.JSX.Element {
	const navigation = useNavigation()
	const { t } = useTranslation('timetable')
	const backgroundColor = String(
		toColor(useCSSVariable('--color-background')) ?? '#f2f2f2'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c1e')
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const [loaded, setLoaded] = useState(false)
	const [timeoutId, setTimeoutId] = useState<number | null>(null)

	const htmlContent = useRouteParamsStore((state) => state.htmlContent)

	const sanitizedHtml = sanitizeHtml(htmlContent?.html ?? '', {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3']),
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			'*': ['style', 'class']
		}
	})

	const styledHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          html, body {
            background-color: ${backgroundColor};
            margin: 0;
            padding: 0;
            height: 100%;
          }
          body {
            padding: ${PADDING}px;
            color: ${textColor};
            background-color: ${backgroundColor};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 16px;
            line-height: 1.5;
          }
          .content-wrapper {
            padding-bottom: ${BOTTOM_PADDING}px;
          }
          h1, h2, h3 {
            color: ${textColor};
            margin-top: 16px;
            margin-bottom: 8px;
          }
          p {
            margin-bottom: 16px;
          }
          a {
            color: ${primaryColor};
            text-decoration: none;
          }
          ul, ol {
            margin-bottom: 16px;
            padding-left: 24px;
          }
          li {
            margin-bottom: 4px;
          }
          .spacer {
            height: ${BOTTOM_PADDING}px;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="content-wrapper">
          ${sanitizedHtml}
          <div class="spacer"></div>
        </div>
      </body>
    </html>`

	useLayoutEffect(() => {
		navigation.setOptions({
			title: htmlContent?.title ?? t('details.title')
		})
	}, [navigation, htmlContent?.title, t])

	useEffect(() => {
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
		}
	}, [timeoutId])

	if (Platform.OS === 'web') {
		const decodeHtmlEntities = (html: string) => {
			const textarea = document.createElement('textarea')
			textarea.innerHTML = html
			return textarea.value
		}

		const plainTextContent = sanitizedHtml
			.replace(
				/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi,
				(_match, content) => `\n\n${decodeHtmlEntities(content)}\n`
			)
			.replace(
				/<p[^>]*>(.*?)<\/p>/gi,
				(_match, content) => `\n${decodeHtmlEntities(content)}\n`
			)
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(
				/<li[^>]*>(.*?)<\/li>/gi,
				(_match, content) => `\n• ${decodeHtmlEntities(content)}`
			)
			.replace(/<(?:.|\n)*?>/gm, '')
			.replace(/\n\s*\n\s*\n/g, '\n\n')
			.trim()

		return (
			<ScrollView contentContainerClassName="p-4 pb-[80px] bg-background">
				<Text className="text-text text-base leading-6">
					{plainTextContent}
				</Text>
			</ScrollView>
		)
	}

	return (
		<View className="flex-1 bg-background">
			<WebView
				source={{ html: styledHtml }}
				scalesPageToFit
				className="flex-1 bg-background"
				onLoadEnd={() => {
					const id = setTimeout(() => {
						setLoaded(true)
					}, LOADING_TIMEOUT)

					setTimeoutId(id as unknown as number)
				}}
				backgroundColor={backgroundColor}
				originWhitelist={['*']}
				showsVerticalScrollIndicator={true}
			/>
			{!loaded && (
				<View
					className="bg-background items-center justify-center"
					style={StyleSheet.absoluteFillObject}
				>
					<LoadingIndicator />
				</View>
			)}
		</View>
	)
}
