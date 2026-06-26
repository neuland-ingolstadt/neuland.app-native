import { router } from 'expo-router'
import type React from 'react'
import { useEffect } from 'react'
import { Linking } from 'react-native'

const STORE_URL = 'https://neuland.app/get'

export default function OfficeToggleWeb(): React.JSX.Element | null {
	useEffect(() => {
		void Linking.openURL(STORE_URL)
		router.replace('/(tabs)')
	}, [])

	return null
}
