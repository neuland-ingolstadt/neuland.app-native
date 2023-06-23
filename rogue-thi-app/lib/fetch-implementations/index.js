import BrowserFetchConnection from './browser-fetch'

/**
 * Helper class that mimics a `fetch` response.
 */
export class HttpResponse {
  /**
   * @param {number} status HTTP status code
   * @param {object} data Error data
   */
  constructor(status, data) {
    this.status = status
    this.data = data
  }

  async text() {
    return this.data
  }

  async json() {
    return JSON.parse(this.data)
  }
}

/**
 * Returns a suitable fetch implementation.
 * @param {object} options Connection parameters, only used by the proxy
 * @returns An object with a `fetch` method.
 */
export default function obtainFetchImplementation(options) {
  return new BrowserFetchConnection(options)
}
