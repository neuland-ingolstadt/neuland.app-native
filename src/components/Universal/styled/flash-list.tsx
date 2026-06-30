import {
	type FlashListProps,
	FlashList as ShopifyFlashList
} from '@shopify/flash-list'
import type { JSX } from 'react'
import { withUniwind } from 'uniwind'

const UniwindFlashList = withUniwind(
	ShopifyFlashList
) as unknown as typeof ShopifyFlashList

export function FlashList<T>({
	ref,
	...props
}: FlashListProps<T> & {
	ref?: React.Ref<ShopifyFlashList<T>>
}): JSX.Element {
	return <UniwindFlashList ref={ref} {...props} />
}
