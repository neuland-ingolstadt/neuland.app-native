import * as Application from 'expo-application'
import { Platform } from 'react-native'
import {
	isNativeAppClip,
	promptFullAppInstall
} from '../../modules/app-clip/src/AppClipModule'

/**
 * True when running inside the Neuland App Clip target.
 */
export function isAppClip(): boolean {
	if (Platform.OS !== 'ios') {
		return false
	}

	if (isNativeAppClip()) {
		return true
	}

	return Application.applicationId?.endsWith('.clip') === true
}

/**
 * Presents the App Store overlay recommending the full Neuland Next app.
 */
export function recommendFullApp(): void {
	promptFullAppInstall()
}
