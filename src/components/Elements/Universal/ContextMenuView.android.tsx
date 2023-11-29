import React from 'react'

export const ContextMenuView = ({
    children,
}: {
    children: React.ReactNode
}): React.ReactElement => {
    return React.createElement(React.Fragment, null, children)
}
