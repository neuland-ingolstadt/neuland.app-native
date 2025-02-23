import ItemsPickerScreen from '@/components/Food/ItemsPickerScreen';
import WorkaroundStack from '@/components/Universal/WorkaroundStack';
import type React from 'react';

export default function Screen(): React.JSX.Element {
	return (
		<WorkaroundStack
			name={'Allergens'}
			titleKey={'navigation.allergens'}
			component={ItemsPickerScreen}
			params={{ type: 'allergens' }}
			androidFallback
		/>
	);
}
