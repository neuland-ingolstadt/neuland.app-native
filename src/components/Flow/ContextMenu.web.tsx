import type React from 'react'
import type { JSX } from 'react'

export default function ContextMenu({
	children
}: {
	children: JSX.Element[]
}): React.JSX.Element {
	// TODO hook right click and show actions there
	return <>{children}</>
}
