import type React from 'react'
import ItemsPickerScreen from '@/components/Food/ItemsPickerScreen'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'

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
