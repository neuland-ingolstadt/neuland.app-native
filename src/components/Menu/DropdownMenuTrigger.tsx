import type React from 'react'
import { Platform } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['Trigger']>

const DropdownMenuTrigger = DropdownMenu.create((props: ItemProps) => {
	const { styles } = useStyles(stylesheet)
	return (
		<DropdownMenu.Trigger
			style={styles.item as React.CSSProperties}
			{...props}
		/>
	)
}, 'Trigger')

export default DropdownMenuTrigger

// @ts-expect-error - Contains some web specific code
const stylesheet = createStyleSheet((theme) => ({
	item: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.text,
		borderRadius: 6,
		borderWidth: 0,
		fontSize: 18,
		outlineStyle: 'none',
		paddingLeft:
			Platform.OS === 'web' ? 14 : Platform.OS === 'android' ? 10 : 0,
		paddingRight: Platform.OS === 'android' ? 10 : 0,
		paddingVertical: 10
	}
}))
