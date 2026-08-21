/** @typedef {{ url: string, organization: string, project: string }} RustrakSourcemapsOptions */

/** @type {RustrakSourcemapsOptions} */
const DEFAULTS = {
	url: 'https://rustrak.neuland.app/',
	organization: 'neuland',
	project: 'neuland-next'
}

/** @param {Partial<RustrakSourcemapsOptions> | undefined} options */
function resolveOptions(options) {
	return {
		url: options?.url ?? process.env.SENTRY_URL ?? DEFAULTS.url,
		organization:
			options?.organization ?? process.env.SENTRY_ORG ?? DEFAULTS.organization,
		project: options?.project ?? process.env.SENTRY_PROJECT ?? DEFAULTS.project
	}
}

module.exports = { DEFAULTS, resolveOptions }
