export interface OfficePresenceStatus {
	count: number
	registered: boolean
	expiresAt?: string | null
}

export interface OfficePresenceMutation {
	registered: boolean
	expiresAt?: string | null
}
