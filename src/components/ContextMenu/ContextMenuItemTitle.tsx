import type React from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as ContextMenu from 'zeego/context-menu'

// Add destructive prop to component props
type ItemProps = React.ComponentProps<(typeof ContextMenu)['ItemTitle']> & {
	destructive?: boolean
}

const ContextMenuItemTitle = ContextMenu.create((props: ItemProps) => {
	const { styles } = useStyles(stylesheet)
	const { destructive, ...rest } = props

	return (
		<ContextMenu.ItemTitle
			style={{ ...styles.item, ...styles.color(destructive) }}
			{...rest}
		/>
	)
}, 'ItemTitle')

export default ContextMenuItemTitle

const stylesheet = createStyleSheet((theme) => ({
	item: {
		fontSize: 16,
		fontWeight: '500',
		paddingRight: 6
	},
	color: (destructive) => ({
		color: destructive ? theme.colors.notification : theme.colors.text
	})
}))
