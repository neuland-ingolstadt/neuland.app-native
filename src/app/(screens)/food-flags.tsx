import type React from 'react'
import ItemsPickerScreen from '@/components/Food/ItemsPickerScreen'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'

export default function Screen(): React.JSX.Element {
	return (
		<WorkaroundStack
			name={'flags'}
			titleKey={'navigation.flags'}
			component={ItemsPickerScreen}
			params={{ type: 'flags' }}
			androidFallback
		/>
	)
}
