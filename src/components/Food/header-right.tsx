import { Link } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

import PlatformIcon from '../Universal/Icon'

export const FoodHeaderRight = (): React.JSX.Element => {
	const { t } = useTranslation(['accessibility'])
	const textColor = useCSSVariable('--color-text') as string | undefined

	return (
		<Link asChild href="/food-preferences">
			<Pressable
				hitSlop={10}
				className="android:mx-3.5 ios:mx-1.5"
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
					style={{
						color: toColor(textColor)
					}}
				/>
			</Pressable>
		</Link>
	)
}
