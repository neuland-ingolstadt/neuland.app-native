import LocalStorageCache from '@/stores/cache'

import packageInfo from '../../package.json'

const ENDPOINT: string =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
    process.env.EXPO_PUBLIC_NEULAND_API_ENDPOINT || 'https://neuland.app'
const USER_AGENT = `neuland.app-native/${packageInfo.version} (+${packageInfo.homepage})`

class NeulandAPIClient {
    protected cache: LocalStorageCache

    constructor() {
        this.cache = new LocalStorageCache({
            namespace: 'neuland-api-client',
            ttl: 5 * 60 * 1000, // 5 minutes
        })
    }

    /**
     * Performs a request against the neuland.app API
     * @param {string} url
     */
    async performRequest(url: string): Promise<any> {
        const resp = await fetch(`${url}`, {
            headers: {
                'User-Agent': USER_AGENT,
            },
        })

        if (resp.status === 200) {
            return await resp.json()
        } else {
            throw new Error('API returned an error: ' + (await resp.text()))
        }
    }

    /**
     * Performs an cached request against the API
     * @param {string} cacheKey Unique key that identifies this request
     * @param {object} params Request data
     * @returns {object}
     */
    async requestCached(cacheKey: string, url: string): Promise<any> {
        const cached = await this.cache.get(cacheKey)
        if (cached !== undefined) {
            console.log('Using cached value for', cacheKey)
            return cached
        }
        console.log('Requesting', cacheKey)
        const resp = await this.performRequest(url)
        await this.cache.set(cacheKey, resp)

        return resp
    }

    async getMensaPlan(): Promise<any> {
        return await this.requestCached('mensa-plan', `${ENDPOINT}/api/mensa`)
    }

    async getReimannsPlan(): Promise<any> {
        return await this.requestCached(
            'reimanns-plan',
            `${ENDPOINT}/api/reimanns`
        )
    }

    async getCanisiusPlan(): Promise<any> {
        return await this.requestCached(
            'canisius-plan',
            `${ENDPOINT}/api/canisius`
        )
    }

    /**
     * @param {string} station Bus station identifier
     */
    async getBusPlan(station: string): Promise<any> {
        return await this.performRequest(
            `${ENDPOINT}/api/bus/${encodeURIComponent(station)}`
        )
    }

    /**
     * @param {string} station Train station identifier
     */
    async getTrainPlan(station: string): Promise<any> {
        return await this.performRequest(
            `${ENDPOINT}/api/train/${encodeURIComponent(station)}`
        )
    }

    async getParkingData(): Promise<any> {
        return await this.performRequest(`${ENDPOINT}/api/parking`)
    }

    async getCharingStationData(): Promise<any> {
        return await this.performRequest(`${ENDPOINT}/api/charging-stations`)
    }

    async getCampusLifeEvents(): Promise<any> {
        return await this.performRequest(`${ENDPOINT}/api/cl-events`)
    }
}

export default new NeulandAPIClient()
