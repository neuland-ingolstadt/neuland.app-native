import { Check } from 'lucide-react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['ItemIcon']>

const DropdownMenuCheckIcon = DropdownMenu.create((props: ItemProps) => {
    return (
        <DropdownMenu.ItemIcon
            ios={{
                name: 'checkmark',
            }}
            style={styles.check}
            {...props}
        >
            <Check size={18} />
        </DropdownMenu.ItemIcon>
    )
}, 'ItemIcon')

const styles = StyleSheet.create({
    // eslint-disable-next-line react-native/no-color-literals
    check: {
        color: 'white',
    },
})
export default DropdownMenuCheckIcon
