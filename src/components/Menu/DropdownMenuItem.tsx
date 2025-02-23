import React from 'react'
import { useStyles } from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['Item']>

const DropdownMenuItem = DropdownMenu.create((props: ItemProps) => {
    const { theme } = useStyles()
    const [focused, setFocused] = React.useState(false)
    return (
        <DropdownMenu.Item
            // @ts-expect-error
            style={{
                ...styles.item,
                backgroundColor: focused ? theme.colors.background : undefined,
            }}
            {...props}
            onFocus={() => {
                setFocused(true)
            }}
            onBlur={() => {
                setFocused(false)
            }}
        />
    )
}, 'CheckboxItem')

export default DropdownMenuItem

const styles = {
    item: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        columnGap: 20,
        cursor: 'pointer',
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 8,
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Liberation Sans", Helvetica, Arial, sans-serif',
        outline: 'none',
        outlineStyle: 'none',
    },
}
