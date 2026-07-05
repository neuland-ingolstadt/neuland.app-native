import * as Sentry from '@sentry/react-native'
import * as Application from 'expo-application'
import Constants from 'expo-constants'

const dsn = "https://009f5dcd6f26428bbb9453044e376a22@glitchtip.alexpts.de/1"

let initialized = false

export function initSentry(): void {
	if (initialized || !dsn) return

	Sentry.init({
		dsn,
		tracesSampleRate: 1.0,
		enableAutoSessionTracking: false,
		environment: __DEV__ ? 'development' : 'production',
		release: `${Application.applicationId}@${Application.nativeApplicationVersion ?? Constants.expoConfig?.version}+${Application.nativeBuildVersion ?? '0'}`
	})

	initialized = true
}

export function captureSentryException(
	error: unknown,
	context?: Record<string, string>
): void {
	if (!dsn) return

	Sentry.withScope((scope) => {
		if (context) {
			for (const [key, value] of Object.entries(context)) {
				scope.setTag(key, value)
			}
		}

		Sentry.captureException(error)
	})
}
