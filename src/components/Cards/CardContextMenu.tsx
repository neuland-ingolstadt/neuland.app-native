import { type RelativePathString, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ContextMenu from 'zeego/context-menu';

interface CardContextMenuProps {
	card: JSX.Element;
	title: string;
	onPressRoute?: string;
	removable?: boolean;
	hideDashboardEntry?: (title: string) => void;
	resetOrder?: (userKind: string) => void;
	userKind?: string;
}

export function CardContextMenu({
	card,
	title,
	onPressRoute,
	removable = true,
	hideDashboardEntry,
	resetOrder,
	userKind
}: CardContextMenuProps): JSX.Element {
	const { t } = useTranslation('navigation');

	const handleItemPress = (action: string) => {
		if (action === t('contextMenu.settings')) {
			router.navigate('/dashboard');
		}
		if (action === t('contextMenu.hide') && hideDashboardEntry) {
			hideDashboardEntry(title);
		}
		if (action === t('contextMenu.reset') && resetOrder && userKind) {
			resetOrder(userKind);
		}
	};

	const handlePreviewPress = () => {
		if (onPressRoute != null) {
			router.navigate(onPressRoute as RelativePathString);
		}
	};

	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger>{card}</ContextMenu.Trigger>

			<ContextMenu.Content>
				<ContextMenu.Item
					key="settings"
					onSelect={() => handleItemPress(t('contextMenu.settings'))}
				>
					<ContextMenu.ItemIcon
						ios={{
							name: 'gear'
						}}
					/>
					<ContextMenu.ItemTitle>
						{t('contextMenu.settings')}
					</ContextMenu.ItemTitle>
				</ContextMenu.Item>

				{removable && (
					<ContextMenu.Item
						key="hide"
						destructive
						onSelect={() => handleItemPress(t('contextMenu.hide'))}
					>
						<ContextMenu.ItemIcon
							ios={{
								name: 'eye.slash'
							}}
						/>
						<ContextMenu.ItemTitle>
							{t('contextMenu.hide')}
						</ContextMenu.ItemTitle>
					</ContextMenu.Item>
				)}

				<ContextMenu.Item
					key="reset"
					destructive
					onSelect={() => handleItemPress(t('contextMenu.reset'))}
				>
					<ContextMenu.ItemIcon
						ios={{
							name: 'arrow.counterclockwise'
						}}
					/>
					<ContextMenu.ItemTitle>
						{t('contextMenu.reset')}
					</ContextMenu.ItemTitle>
				</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
