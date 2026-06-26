import { isNeulandAppHost } from '@/utils/neuland-hosts'

export function parseUniversalLinkPath(url: string): string | null {
	try {
		const parsed = new URL(url)
		if (!isNeulandAppHost(parsed.hostname)) {
			return null
		}

		const path = `${parsed.pathname}${parsed.search}`.replace(/^\/+/, '')

		return path.length > 0 ? path : null
	} catch {
		return null
	}
}

export function normalizeRoutePath(path: string): string {
	return path.replace(/^\/+/, '').replace(/\/+$/, '')
}
