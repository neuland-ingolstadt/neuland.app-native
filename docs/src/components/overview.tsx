import type { PageMapItem } from 'nextra'
import { Cards } from 'nextra/components'
import { useMDXComponents } from 'nextra/mdx-components'
import { getIndexPageMap, getPageMap } from 'nextra/page-map'
import type { FC } from 'react'

export const OverviewPage: FC<{
	filePath: string
	icons?: Record<string, FC>
	pageMap?: PageMapItem[]
}> = async ({ filePath, icons, pageMap: $pageMap }) => {
	// @ts-expect-error -- fixme
	const { h2: H2 } = useMDXComponents({})
	const currentRoute = filePath.replace('app', '').replace('/page.mdx', '')
	const pageMap = $pageMap ?? (await getPageMap(currentRoute))

	return getIndexPageMap(pageMap).map((pageItem, index) => {
		if (!Array.isArray(pageItem)) {
			return (
				<H2 key={pageItem.title || `section-${index}`}>{pageItem.title}</H2>
			)
		}
		return (
			<Cards key={`cards-${pageItem[0]?.name || index}`}>
				{pageItem.map((item) => {
					const icon = item.frontMatter?.icon
					const Icon = icons?.[icon]
					if (icon && !Icon) {
						throw new Error(
							`Icon "${icon}" is defined in front matter but isn't provided`
						)
					}
					return (
						<Cards.Card
							key={item.name}
							// @ts-expect-error -- fixme
							title={item.title}
							// @ts-expect-error -- fixme
							href={item.route || item.href}
							icon={Icon && <Icon />}
						/>
					)
				})}
			</Cards>
		)
	})
}
