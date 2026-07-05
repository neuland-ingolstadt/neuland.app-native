import type React from 'react'

interface SecurityWarningModalProps {
	visible: boolean
	onConfirm: () => void
	onCancel: () => void
}

export function SecurityWarningModal(
	_props: SecurityWarningModalProps
): React.JSX.Element | null {
	return null
}
