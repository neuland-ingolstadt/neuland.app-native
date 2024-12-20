import React from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['CheckboxItem']>

const DropdownMenuCheckboxItem = DropdownMenu.create((props: ItemProps) => {
    const { styles } = useStyles(stylesheet)
    return <DropdownMenu.CheckboxItem style={styles.item} {...props} />
}, 'CheckboxItem')

export default DropdownMenuCheckboxItem

const stylesheet = createStyleSheet(() => ({
    item: {
        fontFamily: 'Roboto',
        fontSize: 18,
        paddingVertical: 20,
    },
}))
