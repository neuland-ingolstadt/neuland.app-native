import ItemsPickerScreen from '@/components/Elements/Food/ItemsPickerScreen'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import React from 'react'

export default function Screen(): JSX.Element {
    return (
        <WorkaroundStack
            name={'Flags'}
            titleKey={'navigation.flags'}
            component={ItemsPickerScreen}
            params={{ type: 'flags' }}
        />
    )
}
