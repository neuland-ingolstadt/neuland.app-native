import type React from 'react'

interface CardContextMenuProps {
	card: React.JSX.Element
}

export function CardContextMenu({
	card
}: CardContextMenuProps): React.JSX.Element {
	return <>{card}</>
}
