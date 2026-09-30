import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test'
import { reactNativePlatform } from './react-native-mock'

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
	reactNativePlatform.OS = 'ios'
	walletUtils = await import('../wallet-utils')
})

afterAll(() => {
	reactNativePlatform.OS = 'web'
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
		expect(walletUtils.getWalletErrorCode({ code: 42 })).toBeUndefined()
	})

	it('hasMemberPassInWallet - Should query Apple Wallet by pass type id', async () => {
		reactNativePlatform.OS = 'ios'
		mockHasPass.mockReset()
		mockHasPass.mockResolvedValueOnce(true)

		const result = await walletUtils.hasMemberPassInWallet()

		expect(result).toBe(true)
		expect(mockHasPass).toHaveBeenCalledWith(
			walletUtils.APPLE_MEMBER_PASS_TYPE_ID
		)
	})

	it('hasMemberPassInWallet - Should return false off iOS', async () => {
		reactNativePlatform.OS = 'android'
		mockHasPass.mockReset()

		await expect(walletUtils.hasMemberPassInWallet()).resolves.toBe(false)
		expect(mockHasPass).not.toHaveBeenCalled()

		reactNativePlatform.OS = 'web'
		await expect(walletUtils.hasMemberPassInWallet()).resolves.toBe(false)
	})

	it('hasMemberPassInWallet - Should return false when hasPass throws', async () => {
		reactNativePlatform.OS = 'ios'
		mockHasPass.mockReset()
		mockHasPass.mockRejectedValueOnce(new Error('wallet unavailable'))

		await expect(walletUtils.hasMemberPassInWallet()).resolves.toBe(false)
	})

	it('viewMemberPassInWallet - Should open the pass in Apple Wallet', async () => {
		reactNativePlatform.OS = 'ios'
		mockViewInWallet.mockReset()
		mockViewInWallet.mockResolvedValueOnce(true)

		const result = await walletUtils.viewMemberPassInWallet()

		expect(result).toBe(true)
		expect(mockViewInWallet).toHaveBeenCalledWith(
			walletUtils.APPLE_MEMBER_PASS_TYPE_ID
		)
	})

	it('viewMemberPassInWallet - Should return false off iOS', async () => {
		reactNativePlatform.OS = 'android'
		mockViewInWallet.mockReset()

		await expect(walletUtils.viewMemberPassInWallet()).resolves.toBe(false)
		expect(mockViewInWallet).not.toHaveBeenCalled()
	})

	it('viewMemberPassInWallet - Should return false when viewInWallet throws', async () => {
		reactNativePlatform.OS = 'ios'
		mockViewInWallet.mockReset()
		mockViewInWallet.mockRejectedValueOnce(new Error('wallet unavailable'))

		await expect(walletUtils.viewMemberPassInWallet()).resolves.toBe(false)
	})

	it('APPLE_MEMBER_PASS_TYPE_ID - Should match the app entitlement', () => {
		expect(walletUtils.APPLE_MEMBER_PASS_TYPE_ID).toBe(
			'pass.member.neuland.app'
		)
	})
})
