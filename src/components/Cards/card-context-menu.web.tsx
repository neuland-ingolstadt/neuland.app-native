import type { JSX } from 'react'

interface CardContextMenuProps {
	card: JSX.Element
}

export function CardContextMenu({ card }: CardContextMenuProps): JSX.Element {
	return <>{card}</>
}
