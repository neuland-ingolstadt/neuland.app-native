import { beforeAll, describe, expect, it, mock } from 'bun:test'

mock.module('react-native', () => ({
	Platform: { OS: 'ios' }
}))

const mockHasPass = mock(async (): Promise<boolean> => false)
const mockViewInWallet = mock(async (): Promise<boolean> => false)

mock.module('react-native-wallet-manager', () => ({
	default: {
		hasPass: mockHasPass,
		viewInWallet: mockViewInWallet
	}
}))

let walletUtils: typeof import('../wallet-utils')

beforeAll(async () => {
	walletUtils = await import('../wallet-utils')
})

describe('wallet-utils', () => {
	it('getWalletErrorCode - Should read code from wallet errors', () => {
		expect(
			walletUtils.getWalletErrorCode({
				code: 'PASS_ALREADY_EXISTS',
				message: 'This pass is already in your wallet'
			})
		).toBe('PASS_ALREADY_EXISTS')
		expect(walletUtils.getWalletErrorCode(new Error('nope'))).toBeUndefined()
		expect(walletUtils.getWalletErrorCode(null)).toBeUndefined()
	})

	it('hasMemberPassInWallet - Should query Apple Wallet by pass type id', async () => {
		mockHasPass.mockReset()
		mockHasPass.mockResolvedValueOnce(true)

		const result = await walletUtils.hasMemberPassInWallet()

		expect(result).toBe(true)
		expect(mockHasPass).toHaveBeenCalledWith(
			walletUtils.APPLE_MEMBER_PASS_TYPE_ID
		)
	})

	it('viewMemberPassInWallet - Should open the pass in Apple Wallet', async () => {
		mockViewInWallet.mockReset()
		mockViewInWallet.mockResolvedValueOnce(true)

		const result = await walletUtils.viewMemberPassInWallet()

		expect(result).toBe(true)
		expect(mockViewInWallet).toHaveBeenCalledWith(
			walletUtils.APPLE_MEMBER_PASS_TYPE_ID
		)
	})

	it('APPLE_MEMBER_PASS_TYPE_ID - Should match the app entitlement', () => {
		expect(walletUtils.APPLE_MEMBER_PASS_TYPE_ID).toBe(
			'pass.member.neuland.app'
		)
	})
})
