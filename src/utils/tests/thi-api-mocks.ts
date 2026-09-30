import { mock } from 'bun:test'

export class MockAPIError extends Error {
	public status: number
	public data: unknown

	constructor(status: number, data: unknown) {
		super(`${JSON.stringify(data)} (${status.toString()})`)
		this.status = status
		this.data = data
	}
}

export const loginMock = mock(
	async (
		_username: string,
		_password: string
	): Promise<{ session: string; isStudent: boolean }> => ({
		session: 'new-session',
		isStudent: true
	})
)

export const logoutMock = mock(async (_session: string) => true)

export const thiApiMock = {
	APIError: MockAPIError,
	ThiAPIClient: class {
		login = loginMock
		logout = logoutMock
		isAlive = mock(async () => true)
		request = mock(async () => ({ status: 0, data: [] }))
	},
	default: {
		login: loginMock,
		logout: logoutMock
	}
}

export function resetThiApiMocks(): void {
	loginMock.mockReset()
	loginMock.mockImplementation(async () => ({
		session: 'new-session',
		isStudent: true
	}))
	logoutMock.mockReset()
	logoutMock.mockImplementation(async () => true)
}
