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
        backgroundColor: theme.colors.cardButton,
        borderRadius: 8,
        boxShadow: 'rgba(0, 0, 0, 0.3) 0px 5px 20px',
        marginLeft: 6,
        marginTop: 6,
        paddingBottom: 4,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
    },
}))
