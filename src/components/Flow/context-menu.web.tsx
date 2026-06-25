import type React from 'react'

export default function ContextMenu({
	children
}: {
	children: React.JSX.Element[]
}): React.JSX.Element {
	// TODO hook right click and show actions there
	return <>{children}</>
}
