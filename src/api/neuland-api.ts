import packageInfo from '../../package.json'

const ENDPOINT: string =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
    process.env.EXPO_PUBLIC_NEULAND_API_ENDPOINT || 'https://neuland.app'
const USER_AGENT = `neuland.app-native/${packageInfo.version} (+${packageInfo.homepage})`

/**
 * Neuland API client class for performing requests against the neuland.app API
 */
class NeulandAPIClient {
    /**
     * Performs a request against the neuland.app API
     * @param {string} url The URL to perform the request against
     * @returns {Promise<any>} A promise that resolves with the response data
     * @throws {Error} If the API returns an error
     */
    async performRequest(url: string): Promise<any> {
        console.log(`Performing request against ${url}`)
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
     * Gets the mensa plan
     * @returns {Promise<any>} A promise that resolves with the mensa plan data
     */
    async getMensaPlan(): Promise<any> {
        return await this.performRequest(`${ENDPOINT}/api/mensa/?version=v2`)
    }

    /**
     * Gets the Reimanns plan
     * @returns {Promise<any>} A promise that resolves with the Reimanns plan data
     */
    async getReimannsPlan(): Promise<any> {
        return await this.performRequest(`${ENDPOINT}/api/reimanns/?version=v2`)
    }

    /**
     * Gets the Canisius plan
     * @returns {Promise<any>} A promise that resolves with the Canisius plan data
     */
    async getCanisiusPlan(): Promise<any> {
        return await this.performRequest(`${ENDPOINT}/api/canisius/?version=v2`)
    }

    /**
     * Gets the campus life events
     * @returns {Promise<any>} A promise that resolves with the campus life events data
     */
    async getCampusLifeEvents(): Promise<any> {
        return await this.performRequest(`${ENDPOINT}/api/cl-events/`)
    }
}

export default new NeulandAPIClient()
