import type React from 'react'
import { useUniversalLinkHandler } from '@/hooks/useUniversalLinkHandler'

interface UniversalLinkHandlerProps {
	isAppReady: boolean
}

export function UniversalLinkHandler({
	isAppReady
}: UniversalLinkHandlerProps): React.JSX.Element | null {
	useUniversalLinkHandler(isAppReady)
	return null
}
