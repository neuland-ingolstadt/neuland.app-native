import { Redirect } from 'expo-router'
import type React from 'react'
import MensaAppClip from '@/components/AppClip/mensa-app-clip'
import { isAppClip } from '@/utils/app-clip'

/**
 * Public Mensa entry for App Clip / QR / NFC invocation URLs.
 * In the full app, redirect into the Food tab.
 */
export default function MensaRoute(): React.JSX.Element {
	if (isAppClip()) {
		return <MensaAppClip />
	}

	return <Redirect href="/food" />
}
