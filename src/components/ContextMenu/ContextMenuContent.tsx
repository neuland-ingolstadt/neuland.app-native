import type React from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as ContextMenu from 'zeego/context-menu'

type ItemProps = React.ComponentProps<(typeof ContextMenu)['Content']>

const ContextMenuContent = ContextMenu.create((props: ItemProps) => {
	const { styles } = useStyles(stylesheet)
	return <ContextMenu.Content style={styles.item} {...props} />
}, 'Content')

export default ContextMenuContent

const stylesheet = createStyleSheet((theme) => ({
	item: {
		backgroundColor: theme.colors.cardButton,
		borderRadius: 8,
		boxShadow: 'rgba(0, 0, 0, 0.3) 0px 5px 20px',
		marginLeft: 4,
		marginTop: 6,
		paddingBottom: 4,
		paddingLeft: 4,
		paddingRight: 4,
		paddingTop: 4
	}
}))
