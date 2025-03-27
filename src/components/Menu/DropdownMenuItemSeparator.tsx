import type React from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['Separator']>

const DropdownMenuSeparator = DropdownMenu.create((props: ItemProps) => {
	const { styles } = useStyles(stylesheet)
	return <DropdownMenu.Separator style={styles.item} {...props} />
}, 'Separator')

export default DropdownMenuSeparator

const stylesheet = createStyleSheet((theme) => ({
	item: {
		backgroundColor: theme.colors.labelTertiaryColor,
		height: 1,
		marginBottom: 4,
		marginTop: 4
	}
}))
