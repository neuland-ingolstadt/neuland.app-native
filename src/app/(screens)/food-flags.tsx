import type React from 'react'
import ItemsPickerScreen from '@/components/Food/items-picker-screen'
import WorkaroundStack from '@/components/Universal/workaround-stack'

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
