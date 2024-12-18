import { Platform } from 'react-native'

import packageInfo from '../../package.json'

const ENDPOINT_HOST = 'hiplan.thi.de'
const ENDPOINT_URL = '/webservice/zits_s_40_test/index.php'
const USER_AGENT = `neuland.app-native/${packageInfo.version} (+${packageInfo.homepage})`

/**
 * Error that is thrown when the API indicates an error.
 */
export class APIError extends Error {
    public status: number
    public data: object

    constructor(status: number, data: object) {
        super(`${JSON.stringify(data)} (${status})`)
        this.status = status
        this.data = data
    }
}

/**
 * Client for accessing the API without authentication.
 * This client implements its own caching. If run in the browser,
 * responses will be cached in `localStorage` for `CACHE_TTL`.
 *
 * @see {@link https://github.com/neuland-ingolstadt/neuland.app/blob/develop/docs/thi-rest-api.md}
 */
export class AnonymousAPIClient {
    /**
     * Submits an API request to the THI backend using a WebSocket proxy
     */
    async request(params: Record<string, string>): Promise<any> {
        const apiKey = process.env.EXPO_PUBLIC_THI_API_KEY ?? ''
        const headersObj: Record<string, string> = {
            Host: ENDPOINT_HOST,
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-API-KEY': apiKey,
        }
        if (Platform.OS !== 'web') headersObj['User-Agent'] = USER_AGENT

        const headers = new Headers(headersObj)

        const resp = await fetch(`https://${ENDPOINT_HOST}${ENDPOINT_URL}`, {
            method: 'POST',
            body: new URLSearchParams(params).toString(),
            headers,
        })

        try {
            return await resp.json()
        } catch (e) {
            throw new Error(`Response is not valid JSON (${await resp.text()})`)
        }
    }

    /**
     * Creates a login session.
     */
    async login(
        username: string,
        passwd: string
    ): Promise<{ session: string; isStudent: boolean }> {
        const res = await this.request({
            service: 'session',
            method: 'open',
            format: 'json',
            username,
            passwd,
        })

        if (res.status !== 0) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            throw new APIError(res.status, res.data)
        }

        return {
            session: res.data[0],
            isStudent: res.data[2] === 3,
        }
    }

    /**
     * Checks whether the session is still valid.
     * @param {string} session Session token
     * @returns {boolean} `true` if the session is valid.
     */
    async isAlive(session: string | null): Promise<boolean> {
        if (session == null) {
            return false
        }
        const res = await this.request({
            service: 'session',
            method: 'isalive',
            format: 'json',
            session,
        })

        return res.data === 'STATUS_OK'
    }

    /**
     * Destroys a session.
     * @param {string} session Session token
     * @returns {boolean} `true` if the session was destroyed.
     */
    async logout(session: string): Promise<boolean> {
        const res = await this.request({
            service: 'session',
            method: 'close',
            format: 'json',
            session,
        })

        return res.data === 'STATUS_OK'
    }
}

export default new AnonymousAPIClient()
