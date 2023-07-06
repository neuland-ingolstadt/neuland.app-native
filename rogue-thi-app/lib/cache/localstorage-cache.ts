import AsyncStorage from "@react-native-async-storage/async-storage";

const CHECK_INTERVAL = 10000;

export default class LocalStorageCache {
  private namespace: string;
  private ttl: number;
  private interval: NodeJS.Timeout;

  constructor({ namespace, ttl }: { namespace: string; ttl: number }) {
    this.namespace = namespace;
    this.ttl = ttl;
    this.interval = setInterval(() => this.checkExpiry(), CHECK_INTERVAL);
  }

  private checkExpiry(): void {
    AsyncStorage.getAllKeys()
      .then((keys) =>
        keys
          .filter((x) => x.startsWith(`${this.namespace}-`))
          .forEach((x) =>
            AsyncStorage.getItem(x).then((json) => {
              const { value, expiry } = JSON.parse(json);
              if (expiry < Date.now()) {
                AsyncStorage.removeItem(x);
              }
            })
          )
      )
      .catch((error) => {
        console.error("Error checking cache expiry:", error);
      });
  }

  public close(): void {
    clearInterval(this.interval);
  }

  public async get(key: string): Promise<any> {
    try {
      const json = await AsyncStorage.getItem(`${this.namespace}-${key}`);
      if (!json) {
        return undefined;
      }
      const { value, expiry } = JSON.parse(json);
      if (expiry > Date.now()) {
        return value;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error("Error getting cached value:", error);
      return undefined;
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
      );
    } catch (error) {
      console.error("Error setting cached value:", error);
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.namespace}-${key}`);
    } catch (error) {
      console.error("Error deleting cached value:", error);
    }
  }

  public async flushAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((x) => x.startsWith(`${this.namespace}-`));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error("Error flushing cache:", error);
    }
  }
}
