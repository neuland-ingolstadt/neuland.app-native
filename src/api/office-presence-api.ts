import type {
	OfficePresenceMutation,
	OfficePresenceStatus
} from '@/types/office-presence'

const ENDPOINT =
	process.env.EXPO_PUBLIC_OFFICE_PRESENCE_ENDPOINT ??
	'https://office-presence-api.neuland.app'

function debug(...args: unknown[]): void {
	if (__DEV__) {
		console.debug('[OfficePresence]', ...args)
	}
}

async function officePresenceRequest<TResult>(
	method: 'GET' | 'POST' | 'DELETE',
	token: string
): Promise<TResult> {
	const url = `${ENDPOINT}/api/v1/office/presence`
	debug('request', {
		method,
		url,
		endpoint: ENDPOINT,
		tokenLength: token.length
	})

	let resp: Response
	try {
		resp = await fetch(url, {
			method,
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		})
	} catch (error) {
		debug('fetch failed (network)', error)
		throw error
	}

	debug('response', { status: resp.status, ok: resp.ok })

	if (!resp.ok) {
		const body = await resp.text()
		debug('error body', body)
		throw new Error(
			`Office presence API error: ${resp.status}${body ? ` — ${body}` : ''}`
		)
	}

	const json = (await resp.json()) as TResult
	debug('success', json)
	return json
}

export async function getOfficePresence(
	token: string
): Promise<OfficePresenceStatus> {
	return await officePresenceRequest<OfficePresenceStatus>('GET', token)
}

export async function checkInToOffice(
	token: string
): Promise<OfficePresenceMutation> {
	return await officePresenceRequest<OfficePresenceMutation>('POST', token)
}

export async function checkOutOfOffice(
	token: string
): Promise<OfficePresenceMutation> {
	return await officePresenceRequest<OfficePresenceMutation>('DELETE', token)
}
