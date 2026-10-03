import { NativeModule, requireOptionalNativeModule } from 'expo'

declare class AppClipNativeModule extends NativeModule {
	isAppClip?: boolean
	prompt(): Promise<void>
}

const AppClipNative = requireOptionalNativeModule<AppClipNativeModule>('AppClip')

if (AppClipNative?.isAppClip === true) {
	// biome-ignore lint/suspicious/noExplicitAny: attach App Clip helper on navigator
	;(globalThis as any).navigator = (globalThis as any).navigator ?? {}
	// biome-ignore lint/suspicious/noExplicitAny: navigator typing for App Clip
	;(globalThis as any).navigator.appClip = {
		prompt: () => {
			void AppClipNative.prompt()
		}
	}
}

export function isNativeAppClip(): boolean {
	return AppClipNative?.isAppClip === true
}

export function promptFullAppInstall(): void {
	if (AppClipNative?.isAppClip === true) {
		void AppClipNative.prompt()
	}
}

export default AppClipNative
