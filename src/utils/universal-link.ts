import { isNeulandAppHost } from '@/utils/neuland-hosts'

export function parseUniversalLinkPath(url: string): string | null {
	try {
		const parsed = new URL(url)
		if (!isNeulandAppHost(parsed.hostname)) {
			return null
		}

		const path = stripSurroundingSlashes(`${parsed.pathname}${parsed.search}`)

		return path.length > 0 ? path : null
	} catch {
		return null
	}
}

function stripSurroundingSlashes(path: string): string {
	let start = 0
	let end = path.length

	while (start < end && path.charAt(start) === '/') {
		start++
	}
	while (end > start && path.charAt(end - 1) === '/') {
		end--
	}

	return path.slice(start, end)
}

export function normalizeRoutePath(path: string): string {
	return stripSurroundingSlashes(path)
}
