import AsyncStorage from '@react-native-async-storage/async-storage'

const CHECK_INTERVAL = 10000

/**
 * A class representing a cache stored in local storage.
 */
export default class LocalStorageCache {
    private readonly namespace: string
    private readonly ttl: number
    private readonly interval: NodeJS.Timeout

    /**
     * Creates a new instance of LocalStorageCache.
     * @param {string} namespace - The namespace for the cache.
     * @param {number} ttl - The time-to-live (in milliseconds) for the cache.
     */
    constructor({ namespace, ttl }: { namespace: string; ttl: number }) {
        this.namespace = namespace
        this.ttl = ttl
        this.interval = setInterval(() => {
            void this.checkExpiry()
        }, CHECK_INTERVAL)
    }

    /**
     * Checks the expiry of all items in the cache and removes expired items.
     * @returns {Promise<void>} A promise that resolves when the check is complete.
     */
    private async checkExpiry(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys()
            const filteredKeys = keys.filter((x) =>
                x.startsWith(`${this.namespace}-`)
            )

            for (const key of filteredKeys) {
                const json = (await AsyncStorage.getItem(key)) as string
                const expiry = JSON.parse(json).expiry

                if (expiry < Date.now()) {
                    await AsyncStorage.removeItem(key)
                }
            }
        } catch (error) {
            console.error('Error checking cache expiry:', error)
        }
    }

    /**
     * Stops the cache from checking for expired items.
     * @returns {void}
     */
    public close(): void {
        clearInterval(this.interval)
    }

    /**
     * Gets the value associated with the given key from the cache.
     * @param {string} key - The key to get the value for.
     * @returns {Promise<string|undefined>} A promise that resolves with the value associated with the key, or undefined if the key is not found or the value has expired.
     */
    public async get(key: string): Promise<string | undefined> {
        try {
            const json = await AsyncStorage.getItem(`${this.namespace}-${key}`)
            if (json == null) {
                return undefined
            }
            const { value, expiry } = JSON.parse(json)
            if (expiry > Date.now()) {
                return value
            } else {
                return undefined
            }
        } catch (error) {
            console.error('Error getting cached value:', error)
            return undefined
        }
    }

    /**
     * Sets the value associated with the given key in the cache.
     * @param {string} key - The key to set the value for.
     * @param {*} value - The value to set.
     * @returns {Promise<void>} A promise that resolves when the value is set.
     */
    public async set(key: string, value: any): Promise<void> {
        try {
            await AsyncStorage.setItem(
                `${this.namespace}-${key}`,
                JSON.stringify({
                    value,
                    expiry: Date.now() + this.ttl,
                })
            )
        } catch (error) {
            console.error('Error setting cached value:', error)
        }
    }

    /**
     * Deletes the value associated with the given key from the cache.
     * @param {string} key - The key to delete the value for.
     * @returns {Promise<void>} A promise that resolves when the value is deleted.
     */
    public async delete(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(`${this.namespace}-${key}`)
        } catch (error) {
            console.error('Error deleting cached value:', error)
        }
    }

    /**
     * Deletes all items in the cache.
     * @returns {Promise<void>} A promise that resolves when all items are deleted.
     */
    public async flushAll(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys()
            const cacheKeys = keys.filter((x) =>
                x.startsWith(`${this.namespace}-`)
            )
            await AsyncStorage.multiRemove(cacheKeys)
        } catch (error) {
            console.error('Error flushing cache:', error)
        }
    }
}
