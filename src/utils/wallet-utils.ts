import { Platform } from 'react-native'
import WalletManager from 'react-native-wallet-manager'

/** Apple Wallet pass type identifier for the Neuland member pass. */
export const APPLE_MEMBER_PASS_TYPE_ID = 'pass.member.neuland.app'

export function getWalletErrorCode(error: unknown): string | undefined {
	if (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof (error as { code: unknown }).code === 'string'
	) {
		return (error as { code: string }).code
	}
	return undefined
}

/** Whether the Neuland member pass is already in Apple Wallet (iOS only). */
export async function hasMemberPassInWallet(): Promise<boolean> {
	if (Platform.OS !== 'ios') {
		return false
	}
	try {
		return await WalletManager.hasPass(APPLE_MEMBER_PASS_TYPE_ID)
	} catch {
		return false
	}
}

/** Opens the Neuland member pass in Apple Wallet if present (iOS only). */
export async function viewMemberPassInWallet(): Promise<boolean> {
	if (Platform.OS !== 'ios') {
		return false
	}
	try {
		return await WalletManager.viewInWallet(APPLE_MEMBER_PASS_TYPE_ID)
	} catch {
		return false
	}
}
