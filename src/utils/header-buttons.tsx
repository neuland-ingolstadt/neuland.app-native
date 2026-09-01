import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { router } from 'expo-router'
import { Platform } from 'react-native'
import {
	CloseHeaderButton,
	IosGlassHeaderButton,
	ShareHeaderButton
} from '@/components/Universal/share-header-button'
import { isIos26OrLater } from '@/hooks/useTransparentHeader'
import i18n from '@/localization/i18n'

interface HeaderButtonOptions {
	onShare?: () => void | Promise<void>
	noShare?: boolean
}

/**
 * Returns platform-specific header button configuration
 * - iOS: Share button on left, Close button on right
 * - Android/Web: Share button on right, no close button (uses back gesture/button)
 */
export function getPlatformHeaderButtons({
	onShare,
	noShare = false
}: HeaderButtonOptions): NativeStackNavigationOptions {
	if (Platform.OS === 'ios') {
		if (!isIos26OrLater()) {
			return {
				headerLeft: onShare
					? () => <ShareHeaderButton onPress={onShare} noShare={noShare} />
					: undefined,
				headerRight: () => <CloseHeaderButton />
			}
		}

		const shareLabel = i18n.t('button.share', { ns: 'accessibility' })
		const closeLabel = i18n.t('button.close', { ns: 'accessibility' })

		// SDK 55 mismeasures custom headerLeft/headerRight views on iOS 26, which clips icons or drops their glass surface.
		return {
			unstable_headerLeftItems:
				onShare && !noShare
					? () => [
							{
								type: 'custom',
								hidesSharedBackground: true,
								element: (
									<IosGlassHeaderButton
										icon="share"
										label={shareLabel}
										onPress={onShare}
									/>
								)
							}
						]
					: undefined,
			unstable_headerRightItems: () => [
				{
					type: 'custom',
					hidesSharedBackground: true,
					element: (
						<IosGlassHeaderButton
							icon="close"
							label={closeLabel}
							onPress={() => router.back()}
						/>
					)
				}
			]
		}
	}

	// Android and Web
	return {
		headerLeft: undefined,
		headerRight: onShare
			? () => <ShareHeaderButton onPress={onShare} noShare={noShare} />
			: undefined
	}
}
