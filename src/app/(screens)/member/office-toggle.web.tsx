import type React from 'react'
import { useEffect } from 'react'

const STORE_URL = 'https://neuland.app/get'

export default function OfficeToggleWeb(): React.JSX.Element | null {
	useEffect(() => {
		window.location.replace(STORE_URL)
	}, [])

	return null
}
