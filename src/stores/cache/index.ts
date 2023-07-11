import AsyncStorage from '@react-native-async-storage/async-storage'

const CHECK_INTERVAL = 10000

export default class LocalStorageCache {
    private readonly namespace: string
    private readonly ttl: number
    private readonly interval: NodeJS.Timeout

    constructor({ namespace, ttl }: { namespace: string; ttl: number }) {
        this.namespace = namespace
        this.ttl = ttl
        this.interval = setInterval(() => {
            void this.checkExpiry()
        }, CHECK_INTERVAL)
    }

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

    public close(): void {
        clearInterval(this.interval)
    }

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

    public async delete(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(`${this.namespace}-${key}`)
        } catch (error) {
            console.error('Error deleting cached value:', error)
        }
    }

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
