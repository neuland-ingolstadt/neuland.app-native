const UNIVERSAL_LINK_HOSTS = new Set(['dev.neuland.app', 'web.neuland.app'])

export function parseUniversalLinkPath(url: string): string | null {
	try {
		const parsed = new URL(url)
		if (!UNIVERSAL_LINK_HOSTS.has(parsed.hostname)) {
			return null
		}

		const path = `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(
			/^\/+/,
			''
		)

		return path.length > 0 ? path : null
	} catch {
		return null
	}
}

export function normalizeRoutePath(path: string): string {
	return path.replace(/^\/+/, '').replace(/\/+$/, '')
}
