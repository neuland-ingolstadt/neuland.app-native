import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import { useNavigation } from 'expo-router'
import type React from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import WebView from 'react-native-webview'
import sanitizeHtml from 'sanitize-html'

const PADDING = 16
const LOADING_TIMEOUT = 100
const BOTTOM_PADDING = 80

export default function NotesDetails(): React.JSX.Element {
	const navigation = useNavigation()
	const { t } = useTranslation('timetable')
	const { styles, theme } = useStyles(stylesheet)
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
            background-color: ${theme.colors.background};
            margin: 0;
            padding: 0;
            height: 100%;
          }
          body {
            padding: ${PADDING}px;
            color: ${theme.colors.text};
            background-color: ${theme.colors.background};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 16px;
            line-height: 1.5;
          }
          .content-wrapper {
            padding-bottom: ${BOTTOM_PADDING}px;
          }
          h1, h2, h3 {
            color: ${theme.colors.text};
            margin-top: 16px;
            margin-bottom: 8px;
          }
          p {
            margin-bottom: 16px;
          }
          a {
            color: ${theme.colors.primary};
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

	// For web platforms, render the content directly in a ScrollView
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
			<ScrollView contentContainerStyle={styles.webContentContainer}>
				<Text style={styles.webContent}>{plainTextContent}</Text>
			</ScrollView>
		)
	}

	return (
		<View style={styles.container}>
			<WebView
				source={{ html: styledHtml }}
				scalesPageToFit
				style={styles.webview}
				onLoadEnd={() => {
					const timeoutId = setTimeout(() => {
						setLoaded(true)
					}, LOADING_TIMEOUT)

					setTimeoutId(timeoutId)
				}}
				backgroundColor={theme.colors.background}
				originWhitelist={['*']}
				showsVerticalScrollIndicator={true}
			/>
			{!loaded && (
				<View style={styles.loadingContainer}>
					<LoadingIndicator />
				</View>
			)}
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background
	},
	loadingContainer: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: theme.colors.background,
		alignItems: 'center',
		justifyContent: 'center'
	},
	webContentContainer: {
		padding: PADDING,
		paddingBottom: BOTTOM_PADDING,
		backgroundColor: theme.colors.background
	},
	webContent: {
		color: theme.colors.text,
		fontSize: 16,
		lineHeight: 24
	},
	webview: {
		flex: 1,
		backgroundColor: theme.colors.background
	}
}))
