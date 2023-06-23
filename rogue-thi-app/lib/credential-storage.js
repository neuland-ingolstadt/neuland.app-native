/**
 * Simplified credential storage for usage in Capacitor apps.
 */
export default class CredentialStorage {
  /**
   * @param {string} name Namespace for the credential storage
   */
  constructor(name) {
    this.name = name
  }

  /**
   * Saves credentials in the storage.
   * @param {string} id Unique identifier for this set of credentials
   * @param {object} data Object containing the credentials
   */
  async write(id, data) {
    localStorage[`credentials-${this.name}-${id}`] = JSON.stringify(data)
  }

  /**
   * Reads credentials from the storage.
   * @param {string} id Identifier as used in `write`
   * @returns {object} Object containing the credentials
   */
  async read(id) {
    const serialized = localStorage[`credentials-${this.name}-${id}`]
    return serialized ? JSON.parse(serialized) : undefined
  }

  /**
   * Deletes a set of credentials from the storage
   * @param {string} id Identifier as used in `write`
   */
  async delete(id) {
    delete localStorage[`credentials-${this.name}-${id}`]
  }
}
