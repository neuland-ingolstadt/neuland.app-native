import React from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['Trigger']>

const DropdownMenuTrigger = DropdownMenu.create((props: ItemProps) => {
    const { styles } = useStyles(stylesheet)
    return <DropdownMenu.Trigger style={styles.item} {...props} />
}, 'Trigger')

export default DropdownMenuTrigger

const stylesheet = createStyleSheet((theme) => ({
    item: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.text,
        borderRadius: 6,
        borderWidth: 0,
        fontSize: 18,
        margin: 10,
        padding: 5,
    },
}))
