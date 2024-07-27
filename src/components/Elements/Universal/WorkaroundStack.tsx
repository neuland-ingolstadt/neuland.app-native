import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { type HeaderButtonProps } from '@react-navigation/native-stack/lib/typescript/src/types'
import React, { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'

export interface WorkaroundStackProps {
    name: string
    titleKey: string
    component: any
    transparent?: boolean
    largeTitle?: boolean
    headerSearchBarOptions?: any
    headerRightElement?: ((props: HeaderButtonProps) => ReactNode) | undefined
    params?: any
}

/*
 * This is a generic stack used as workaround for missing or broken features in expo-router
 * We create a second (react-navigation) stack and nest it into the first (expo-router) hidden stack
 * This is needed to have a large title on iOS, search bar and other features
 * @param name - name of the stack
 * @param titleKey - translation key for the title
 * @param component - component to render
 * @param transparent - whether the header should be transparent
 * @param largeTitle - whether the header should be large
 * @param headerRightElement - element to render on the right side of the header
 * @param params - params to pass to the component
 * @returns JSX.Element
 */
function WorkaroundStack({
    name,
    titleKey,
    component,
    transparent = false,
    largeTitle = false,
    headerRightElement = undefined,
    headerSearchBarOptions = undefined,
    params = {},
}: WorkaroundStackProps): JSX.Element {
    const { t } = useTranslation('navigation')
    const Stack = createNativeStackNavigator()

    return (
        <Stack.Navigator>
            <Stack.Screen
                name={name}
                options={{
                    title: t(
                        // @ts-expect-error Type not checked
                        titleKey
                    ),
                    headerShown: true,
                    headerLargeTitle: largeTitle,
                    headerRight: headerRightElement,
                    ...(Platform.OS === 'ios' && transparent
                        ? {
                              headerTransparent: true,
                              headerBlurEffect: 'regular',
                          }
                        : {}),
                    headerSearchBarOptions,
                }}
                component={component}
                initialParams={params}
            />
        </Stack.Navigator>
    )
}

export default WorkaroundStack
