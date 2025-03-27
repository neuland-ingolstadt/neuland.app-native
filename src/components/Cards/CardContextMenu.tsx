import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import * as ContextMenu from 'zeego/context-menu'
import ContextMenuContent from '../ContextMenu/ContextMenuContent'
import ContextMenuItem from '../ContextMenu/ContextMenuItem'
import ContextMenuSeparator from '../ContextMenu/ContextMenuItemSeparator'
import ContextMenuItemTitle from '../ContextMenu/ContextMenuItemTitle'

interface CardContextMenuProps {
	card: JSX.Element
	title: string
	removable?: boolean
	hideDashboardEntry?: (title: string) => void
	resetOrder?: (userKind: string) => void
	userKind?: string
}

export function CardContextMenu({
	card,
	title,
	removable = true,
	hideDashboardEntry,
	resetOrder,
	userKind
}: CardContextMenuProps): JSX.Element {
	const { t } = useTranslation('navigation')

	const handleItemPress = (action: string) => {
		if (action === t('contextMenu.settings')) {
			router.navigate('/dashboard')
		}
		if (action === t('contextMenu.hide') && hideDashboardEntry) {
			hideDashboardEntry(title)
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

				{removable && (
					<>
						<ContextMenuSeparator />
						<ContextMenuItem
							key="hide"
							destructive
							onSelect={() => handleItemPress(t('contextMenu.hide'))}
						>
							<ContextMenu.ItemIcon
								ios={{
									name: 'eye.slash'
								}}
							/>
							<ContextMenuItemTitle destructive>
								{t('contextMenu.hide')}
							</ContextMenuItemTitle>
						</ContextMenuItem>
					</>
				)}
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
