import { router } from 'expo-router'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import ContextMenu from 'react-native-context-menu-view'

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

	const handleItemPress = (e: { nativeEvent: { index: number } }) => {
		const { index } = e.nativeEvent
		if (index === 0) {
			router.navigate('/dashboard')
		}
		if (index === 1 && resetOrder && userKind) {
			resetOrder(userKind)
		}
	}

	return (
		<ContextMenu
			actions={[
				{
					title: t('contextMenu.settings'),
					systemIcon: 'gear'
				},
				{
					title: t('contextMenu.reset'),
					systemIcon: 'arrow.counterclockwise',
					destructive: true
				}
			]}
			onPress={handleItemPress}
		>
			{card}
		</ContextMenu>
	)
}
