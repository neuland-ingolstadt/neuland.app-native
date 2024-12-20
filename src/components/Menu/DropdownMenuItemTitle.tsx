import React from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['ItemTitle']>

const DropdownMenuItemTitle = DropdownMenu.create((props: ItemProps) => {
    const { styles } = useStyles(stylesheet)
    return <DropdownMenu.ItemTitle style={styles.item} {...props} />
}, 'ItemTitle')

export default DropdownMenuItemTitle

const stylesheet = createStyleSheet(() => ({
    item: {
        fontFamily: 'Roboto',
        fontSize: 20,
    },
}))
