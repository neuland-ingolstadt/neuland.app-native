import type React from 'react'
import ItemsPickerScreen from '@/components/Food/items-picker-screen'
import WorkaroundStack from '@/components/Universal/workaround-stack'

export default function Screen(): React.JSX.Element {
	return (
		<WorkaroundStack
			name={'allergens'}
			titleKey={'navigation.allergens'}
			component={ItemsPickerScreen}
			params={{ type: 'allergens' }}
			androidFallback
		/>
	)
}
