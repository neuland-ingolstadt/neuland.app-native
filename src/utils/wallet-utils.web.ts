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

/** Wallet APIs are native-only; always false on web. */
export async function hasMemberPassInWallet(): Promise<boolean> {
	return false
}

/** Wallet APIs are native-only; always false on web. */
export async function viewMemberPassInWallet(): Promise<boolean> {
	return false
}
