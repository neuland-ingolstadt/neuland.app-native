import LocalStorageCache from '@/api/cache'

import packageInfo from '../../package.json'

const ENDPOINT: string = 'https://assets.neuland.app/'
const USER_AGENT = `neuland.app-native/${packageInfo.version} (+${packageInfo.homepage})`

/**
 * Asset API client class for performing requests against the neuland.app asset API
 */
class AssetAPIClient {
    protected cache: LocalStorageCache

    constructor() {
        this.cache = new LocalStorageCache({
            namespace: 'asset-api-client',
            ttl: 14 * 24 * 60 * 60 * 1000, // 2 weeks
        })
    }

    /**
     * Performs a request against the API
     * @param {string} url The URL to perform the request against
     * @returns {Promise<any>} A promise that resolves with the response data
     * @throws {Error} If the API returns an error
     */
    async performRequest(url: string): Promise<any> {
        console.log('Requesting', url)
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
     * @param {string} url The URL to perform the request against
     * @returns {Promise<any>} A promise that resolves with the response data

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

    /**
     * Gets the map overlay
     * @returns {Promise<any>} A promise that resolves with the map overlay data
     */

    async getMapOverlay(): Promise<any> {
        return await this.requestCached(
            `map-overlay-${packageInfo.version}`,
            `${ENDPOINT}rooms_neuland.geojson`
        )
    }
}

export default new AssetAPIClient()
