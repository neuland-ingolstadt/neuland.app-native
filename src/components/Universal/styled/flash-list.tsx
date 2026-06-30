import {
	type FlashListProps,
	FlashList as ShopifyFlashList
} from '@shopify/flash-list'
import type { JSX } from 'react'
import { withUniwind } from 'uniwind'

const UniwindFlashList = withUniwind(
	ShopifyFlashList
) as unknown as typeof ShopifyFlashList

export function FlashList<T>(props: FlashListProps<T>): JSX.Element {
	return <UniwindFlashList {...props} />
}
