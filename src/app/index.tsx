import { Redirect } from 'expo-router'
import Head from 'expo-router/head'
import type React from 'react'
import { StyleSheet, View, useColorScheme } from 'react-native'

export default function App(): React.JSX.Element {
	// This initial page is only used to redirect to the actual app
	// This helps to avoid weird layout issues on Android where the tab bar is not displayed correctly
	const colorScheme = useColorScheme()
	const backgroundColor = colorScheme === 'dark' ? 'black' : 'white'

	return (
		<>
			<Head>
				{/* eslint-disable-next-line i18next/no-literal-string, react-native/no-raw-text */}
				<title>Neuland Next</title>
				<meta
					name="description"
					content="An unofficial campus app for TH Ingolstadt"
				/>
				<meta
					property="og:description"
					content="An unofficial campus app for TH Ingolstadt"
				/>
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<Redirect href={'/(tabs)/(index)'} />
			<View style={{ ...styles.page, backgroundColor }} />
		</>
	)
}

const styles = StyleSheet.create({
	page: {
		flex: 1
	}
})
