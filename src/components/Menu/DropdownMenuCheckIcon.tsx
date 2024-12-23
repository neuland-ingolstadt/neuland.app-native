import React from 'react'
import * as DropdownMenu from 'zeego/dropdown-menu'

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['ItemIcon']>

const DropdownMenuCheckIcon = DropdownMenu.create((props: ItemProps) => {
    return (
        <DropdownMenu.ItemIcon
            ios={{
                name: 'checkmark',
            }}
            {...props}
        />
    )
}, 'ItemIcon')

export default DropdownMenuCheckIcon
