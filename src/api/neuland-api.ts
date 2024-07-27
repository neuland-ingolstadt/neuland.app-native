import { type SpoWeights } from '@/types/asset-api'
import { gql, request } from 'graphql-request'

import packageInfo from '../../package.json'

const GRAPHQL_ENDPOINT: string = 'https://api.dev.neuland.app/graphql'
const ASSET_ENDPOINT: string = 'https://assets.neuland.app'
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

    async performGraphQLQuery(query: string): Promise<any> {
        const data = await request(GRAPHQL_ENDPOINT, query)
        return data
    }

    /**
     * Get the announcement data from the GraphQL API
     * @returns {Promise<any>} A promise that resolves with the announcement data
     */
    async getAnnouncements(): Promise<any> {
        return await this.performGraphQLQuery(gql`
            query {
                announcements {
                    id
                    title {
                        de
                        en
                    }
                    description {
                        de
                        en
                    }
                    startDateTime
                    endDateTime
                    priority
                    url
                }
            }
        `)
    }

    async getFoodPlan(locations: string[]): Promise<any> {
        return await this.performGraphQLQuery(gql`
            query {
                food(locations: [${locations.map((x) => `"${x}"`).join(',')}]) {
                    foodData {
                        timestamp
                        meals {
                            name {
                                de
                                en
                            }
                            id
                            category
                            prices {
                                student
                                employee
                                guest
                            }
                            allergens
                            flags
                            nutrition {
                                kj
                                kcal
                                fat
                                fatSaturated
                                carbs
                                sugar
                                fiber
                                protein
                                salt
                            }
                            variants {
                                name {
                                    de
                                    en
                                }
                                additional
                                id
                                allergens
                                flags
                                originalLanguage
                                static
                                restaurant
                                parent {
                                    id
                                    category
                                }
                                prices {
                                    student
                                    employee
                                    guest
                                }
                            }
                            originalLanguage
                            static
                            restaurant
                        }
                        }
                        errors {
                            location
                            message
                        }
                    }
                }
            `)
    }

    /**
     * Gets the campus life events
     * @returns {Promise<any>} A promise that resolves with the campus life events data
     */
    async getCampusLifeEvents(): Promise<any> {
        return await this.performGraphQLQuery(gql`
            query {
                clEvents {
                    id
                    organizer
                    title
                    begin
                    end
                    location
                    description
                }
            }
        `)
    }

    /**
     * Gets the map overlay
     * @returns {Promise<any>} A promise that resolves with the map overlay data
     */
    async getMapOverlay(): Promise<any> {
        return await this.performRequest(
            `${ASSET_ENDPOINT}/rooms_neuland_v2.4.geojson`
        )
    }

    /**
     * Gets the course spo data (grade weights)
     * @returns {Promise<SpoWeights>} A promise that resolves with the course spo data
     */
    async getSpoWeights(): Promise<SpoWeights> {
        return await this.performRequest(
            `${ASSET_ENDPOINT}/generated/spo-grade-weights.json`
        )
    }
}

export default new NeulandAPIClient()
