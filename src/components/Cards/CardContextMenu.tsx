import { router } from 'expo-router'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import * as ContextMenu from 'zeego/context-menu'
import ContextMenuContent from '../ContextMenu/ContextMenuContent'
import ContextMenuItem from '../ContextMenu/ContextMenuItem'
import ContextMenuSeparator from '../ContextMenu/ContextMenuItemSeparator'
import ContextMenuItemTitle from '../ContextMenu/ContextMenuItemTitle'

interface CardContextMenuProps {
	card: JSX.Element
	resetOrder?: (userKind: string) => void
	userKind?: string
}

export function CardContextMenu({
	card,
	resetOrder,
	userKind
}: CardContextMenuProps): JSX.Element {
	const { t } = useTranslation('navigation')

	const handleItemPress = (action: string) => {
		if (action === t('contextMenu.settings')) {
			router.navigate('/dashboard')
		}
		if (action === t('contextMenu.reset') && resetOrder && userKind) {
			resetOrder(userKind)
		}
	}

	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger>{card}</ContextMenu.Trigger>

			<ContextMenuContent>
				<ContextMenuItem
					key="settings"
					onSelect={() => {
						handleItemPress(t('contextMenu.settings'))
					}}
				>
					<ContextMenu.ItemIcon
						ios={{
							name: 'gear'
						}}
					/>
					<ContextMenuItemTitle>
						{t('contextMenu.settings')}
					</ContextMenuItemTitle>
				</ContextMenuItem>

				<ContextMenuSeparator />
				<ContextMenuItem
					key="reset"
					destructive
					onSelect={() => handleItemPress(t('contextMenu.reset'))}
				>
					<ContextMenu.ItemIcon
						ios={{
							name: 'arrow.counterclockwise'
						}}
					/>
					<ContextMenuItemTitle destructive>
						{t('contextMenu.reset')}
					</ContextMenuItemTitle>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu.Root>
	)
}
