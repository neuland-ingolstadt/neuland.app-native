import ItemsPickerScreen from '@/components/Food/ItemsPickerScreen'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'
import React from 'react'

export default function Screen(): React.JSX.Element {
    return (
        <WorkaroundStack
            name={'Flags'}
            titleKey={'navigation.flags'}
            component={ItemsPickerScreen}
            params={{ type: 'flags' }}
            androidFallback
        />
    )
}
