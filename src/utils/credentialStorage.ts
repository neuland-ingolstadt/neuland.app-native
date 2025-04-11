import { openDB } from 'idb'

const STORE_NAME = 'credentials'

function objectToArrayBuffer(obj: object): ArrayBuffer {
	const uint8Array = new TextEncoder().encode(JSON.stringify(obj))
	return uint8Array.buffer as ArrayBuffer
}

function arrayBufferToObject(buf: ArrayBuffer): object {
	return JSON.parse(new TextDecoder().decode(buf))
}

/**
 * Stores credentials in IndexedDB, encrypted with a non-extractable key.
 * This does not prevent a bad actor from stealing credentials from a device
 * that he has access to, but at least the credentials are not stored in plain
 * text in localStorage.
 *
 * In the future (when Safari supports PasswordCredential), this should be
 * replaced with the Credential Management API.
 */
export default class CredentialStorage {
	name: string

	/**
	 * @param name Namespace for the credential storage
	 */
	constructor(name: string) {
		this.name = name

		if (typeof window === 'undefined') {
			throw new Error('Browser is required')
		}
		if (typeof window.indexedDB === 'undefined') {
			throw new Error('Browser does not support IndexedDB')
		}
		if (typeof window.crypto === 'undefined') {
			throw new Error('Browser does not support SubtleCrypto')
		}
	}

	async _openDatabase() {
		return await openDB(this.name, 1, {
			upgrade(db) {
				db.createObjectStore(STORE_NAME, { keyPath: 'id' })
			}
		})
	}

	/**
	 * Saves credentials in the storage.
	 * @param id Unique identifier for this set of credentials
	 * @param data Object containing the credentials
	 */
	async write(id: string, data: object): Promise<void> {
		const key = await crypto.subtle.generateKey(
			{
				name: 'AES-GCM',
				length: 256
			},
			false,
			['encrypt', 'decrypt']
		)
		const iv = crypto.getRandomValues(new Uint8Array(12)) // AES-GCM typically uses a 12-byte IV

		const encrypted = await crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv
			},
			key,
			objectToArrayBuffer(data)
		)

		const db = await this._openDatabase()
		try {
			await db.put(STORE_NAME, { id, key, iv, encrypted })
		} finally {
			db.close()
		}
	}

	/**
	 * Reads credentials from the storage.
	 * @param id Identifier as used in `write`
	 * @returns Object containing the credentials
	 */
	async read(id: string): Promise<object | undefined> {
		const db = await this._openDatabase()
		try {
			const record = await db.get(STORE_NAME, id)
			if (!record) {
				return undefined
			}

			const { key, iv, encrypted } = record

			if (!key) {
				return undefined
			}

			try {
				const decrypted = await crypto.subtle.decrypt(
					{
						name: 'AES-GCM',
						iv
					},
					key,
					encrypted
				)

				return arrayBufferToObject(decrypted)
			} catch (error) {
				if (error instanceof Error && error.name === 'InvalidAccessError') {
					await this.delete(id)
					return undefined
				}
				throw error
			}
		} finally {
			db.close()
		}
	}

	/**
	 * Deletes a set of credentials from the storage
	 * @param id Identifier as used in `write`
	 */
	async delete(id: string): Promise<void> {
		const db = await this._openDatabase()
		try {
			await db.delete(STORE_NAME, id)
		} finally {
			db.close()
		}
	}
}
