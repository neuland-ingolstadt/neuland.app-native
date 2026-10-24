import * as i18next from 'i18next'

/** Stub `t` while keeping `createInstance` for indoor-nav i18n tests. */
export function i18nextModuleWithStubT() {
	return {
		...i18next,
		t: (key: string) => key
	}
}
