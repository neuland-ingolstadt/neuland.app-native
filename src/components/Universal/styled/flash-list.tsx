import { FlashList as ShopifyFlashList } from '@shopify/flash-list'
import { withUniwind } from 'uniwind'

export const FlashList = withUniwind(
	ShopifyFlashList
) as unknown as typeof ShopifyFlashList
