import { type SpoWeights } from '@/types/asset-api'

import packageInfo from '../../package.json'

const ENDPOINT: string = 'https://assets.neuland.app/'
const USER_AGENT = `neuland.app-native/${packageInfo.version} (+${packageInfo.homepage})`

/**
 * Asset API client class for performing requests against the neuland.app asset API
 */
class AssetAPIClient {
    /**
     * Performs a request against the API
     * @param {string} url The URL to perform the request against
     * @returns {Promise<any>} A promise that resolves with the response data
     * @throws {Error} If the API returns an error
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
     * Gets the map overlay
     * @returns {Promise<any>} A promise that resolves with the map overlay data
     */
    async getMapOverlay(): Promise<any> {
        return await this.performRequest(
            `${ENDPOINT}rooms_neuland_v2.4.geojson`
        )
    }

    /**
     * Gets the course spo data (grade weights)
     * @returns {Promise<SpoWeights>} A promise that resolves with the course spo data
     */
    async getSpoWeights(): Promise<SpoWeights> {
        return await this.performRequest(
            `${ENDPOINT}/generated/spo-grade-weights.json`
        )
    }
}

export default new AssetAPIClient()
