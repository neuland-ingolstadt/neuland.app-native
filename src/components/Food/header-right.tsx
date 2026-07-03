import { Link } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

import PlatformIcon from '../Universal/icon'

export const FoodHeaderRight = (): React.JSX.Element => {
	const { t } = useTranslation(['accessibility'])
	const iconColor = toColor(useCSSVariable('--color-text'))

	return (
		<Link asChild href="/food-preferences">
			<Pressable
				hitSlop={10}
				className={Platform.OS !== 'ios' ? 'mx-3.5' : 'mx-1.5'}
				accessibilityLabel={t('button.foodPreferences')}
			>
				<PlatformIcon
					ios={{
						name: 'line.3.horizontal.decrease',
						size: 19
					}}
					android={{
						name: 'filter_list',
						size: 24
					}}
					web={{
						name: 'ListFilter',
						size: 24
					}}
					style={{ color: iconColor }}
				/>
			</Pressable>
		</Link>
	)
}
