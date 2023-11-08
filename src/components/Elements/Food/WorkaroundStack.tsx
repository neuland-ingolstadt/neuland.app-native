import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'

export interface WorkaroundStackProps {
    name: string
    titleKey: string
    component: any
    transparent?: boolean
    params?: any
}

/*
 * This is a generic stack used as workaround missing feature in expo-router
 * We create a second (react-navigation) stack and nest it into the first (expo-router) hidden stack
 * This is needed to have a large title on iOS, search bar and other features
 * @param name - name of the stack
 * @param titleKey - translation key for the title
 * @param component - component to render
 * @param transparent - whether the header should be transparent
 * @param params - params to pass to the component
 */
function WorkaroundStack({
    name,
    titleKey,
    component,
    transparent = false,
    params = {},
}: WorkaroundStackProps): JSX.Element {
    const { t } = useTranslation('navigation')
    const Stack = createNativeStackNavigator()

    return (
        <>
            <Stack.Navigator>
                <Stack.Screen
                    name={name}
                    options={{
                        title: t(titleKey),
                        headerShown: true,
                        headerLargeTitle: false,
                        ...(Platform.OS === 'ios' && transparent
                            ? {
                                  headerTransparent: true,
                                  headerBlurEffect: 'regular',
                              }
                            : {}),
                    }}
                    component={component}
                    initialParams={params}
                />
            </Stack.Navigator>
        </>
    )
}

export default WorkaroundStack
