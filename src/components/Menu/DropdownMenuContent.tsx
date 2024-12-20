import React from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['Content']>

const DropdownMenuContent = DropdownMenu.create((props: ItemProps) => {
    const { styles } = useStyles(stylesheet)
    return <DropdownMenu.Content style={styles.item} {...props} />
}, 'Content')

export default DropdownMenuContent

const stylesheet = createStyleSheet((theme) => ({
    item: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.text,
        borderRadius: 6,
        borderWidth: 1,
        fontSize: 18,
        margin: 10,
        padding: 5,
    },
}))
