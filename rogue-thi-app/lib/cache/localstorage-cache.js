import AsyncStorage from '@react-native-async-storage/async-storage'

const CHECK_INTERVAL = 10000

export default class LocalStorageCache {
  constructor ({ namespace, ttl }) {
    this.namespace = namespace
    this.ttl = ttl
    this.interval = setInterval(() => this.checkExpiry(), CHECK_INTERVAL)
  }

  checkExpiry () {
    AsyncStorage.getAllKeys()
      .then(keys =>
        keys
          .filter(x => x.startsWith(`${this.namespace}-`))
          .forEach(x =>
            AsyncStorage.getItem(x)
              .then(json => {
                const { value, expiry } = JSON.parse(json)
                if (expiry < Date.now()) {
                  AsyncStorage.removeItem(x)
                }
              })
          )
      )
      .catch(error => {
        console.error('Error checking cache expiry:', error)
      })
  }

  close () {
    clearInterval(this.interval)
  }

  async get (key) {
    try {
      const json = await AsyncStorage.getItem(`${this.namespace}-${key}`)
      if (!json) {
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

  async set (key, value) {
    try {
      await AsyncStorage.setItem(
        `${this.namespace}-${key}`,
        JSON.stringify({
          value,
          expiry: Date.now() + this.ttl
        })
      )
    } catch (error) {
      console.error('Error setting cached value:', error)
    }
  }

  async delete (key) {
    try {
      await AsyncStorage.removeItem(`${this.namespace}-${key}`)
    } catch (error) {
      console.error('Error deleting cached value:', error)
    }
  }

  async flushAll () {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const cacheKeys = keys.filter(x => x.startsWith(`${this.namespace}-`))
      await AsyncStorage.multiRemove(cacheKeys)
    } catch (error) {
      console.error('Error flushing cache:', error)
    }
  }
}
