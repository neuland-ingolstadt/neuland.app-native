import ItemsPickerScreen from '@/components/Food/ItemsPickerScreen'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'
import React from 'react'

export default function Screen(): JSX.Element {
    return (
        <WorkaroundStack
            name={'Allergens'}
            titleKey={'navigation.allergens'}
            component={ItemsPickerScreen}
            params={{ type: 'allergens' }}
            androidFallback
        />
    )
}
