/**
 * Rewrites system / App Clip invocation URLs into in-app routes.
 */
export function redirectSystemPath({
	path
}: {
	path: string
	initial: boolean
}): string {
	try {
		const url = new URL(path, 'neuland://')

		if (url.hostname === 'appclip.apple.com') {
			return '/mensa'
		}

		if (url.pathname === '/mensa' || url.pathname.endsWith('/mensa')) {
			return '/mensa'
		}

		return path
	} catch {
		return path
	}
}
