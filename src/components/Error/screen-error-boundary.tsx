import type { ErrorBoundaryProps } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import ErrorView from './error-view'

/**
 * Per-screen fallback for Expo Router's `unstable_settings.screenErrorBoundary`.
 * Keeps the navigator (headers / tabs) mounted, unlike the root `CrashView`.
 */
export default function ScreenErrorBoundary({
	retry
}: ErrorBoundaryProps): React.JSX.Element {
	const { t } = useTranslation('common')
	const headerPadding = useTransparentHeaderPadding()

	return (
		<View
			className="flex-1 bg-background"
			style={{ paddingTop: headerPadding }}
		>
			<ErrorView
				title={t('error.screen.title')}
				message={t('error.screen.description')}
				buttonText={t('error.screen.retry')}
				onButtonPress={() => {
					retry().catch((retryError) => {
						console.info('Error while retrying screen', retryError)
					})
				}}
			/>
		</View>
	)
}
