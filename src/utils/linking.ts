import { trackEvent } from '@aptabase/react-native'
import { Linking } from 'react-native'

export function pressLink(
	url: string | null | undefined,
	analyticsTag?: string
): void {
	if (url == null) return
	if (analyticsTag) {
		trackEvent('EventLink', { link: analyticsTag })
	}
	void Linking.openURL(url)
}
