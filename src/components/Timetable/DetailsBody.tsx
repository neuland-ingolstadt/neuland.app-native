import type React from 'react'
import { StyleSheet, View } from 'react-native'

export default function DetailsBody({
	children
}: {
	children: React.JSX.Element | JSX.Element[]
}): React.JSX.Element {
	return <View style={styles.detailsBody}>{children}</View>
}

const styles = StyleSheet.create({
	detailsBody: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		flexShrink: 1,
		gap: 4
	}
})
