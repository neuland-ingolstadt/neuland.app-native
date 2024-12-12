import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStackNavigator } from '@react-navigation/stack'
import React, { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

export interface WorkaroundStackProps {
    name: string
    titleKey: string
    component: any
    transparent?: boolean
    largeTitle?: boolean
    headerSearchBarOptions?: any
    headerRightElement?: ((props: any) => ReactNode) | undefined
    params?: any
    androidFallback?: boolean
}

/*
 * This is a generic stack used as workaround for missing or broken features in expo-router
 * We create a second (react-navigation) stack and nest it into the first (expo-router) hidden stack
 * This is needed to have a large title on iOS, search bar and other features
 * @param name - name of the stack
 * @param titleKey - translation key for the title
 * @param component - component to render
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
    androidFallback = false,
}: WorkaroundStackProps): JSX.Element {
    const { t } = useTranslation('navigation')
    const Stack = createNativeStackNavigator()
    const StackAndroid = createStackNavigator()
    const { styles, theme } = useStyles(stylesheet)
    // When using the native stack on Android, the header button is invisible. This is another workaround in the workaround.
    if (Platform.OS === 'android' && androidFallback) {
        return (
            <StackAndroid.Navigator>
                <StackAndroid.Screen
                    name={name}
                    component={component}
                    options={{
                        title: t(
                            // @ts-expect-error Type not checked
                            titleKey
                        ),
                        cardStyle: { backgroundColor: theme.colors.background },
                        headerRight: headerRightElement as any,
                        headerStyle: {
                            backgroundColor:
                                styles.headerBackground.backgroundColor,
                        },

                        headerTitleStyle: { color: theme.colors.text },
                    }}
                    initialParams={params}
                />
            </StackAndroid.Navigator>
        )
    }
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
                    headerLargeTitle: Platform.OS === 'ios' && largeTitle,
                    headerRight: headerRightElement,
                    headerLargeStyle: styles.headerBackground,
                    headerStyle: undefined,
                    headerSearchBarOptions,
                    headerTintColor: theme.colors.primary,
                    contentStyle: styles.background,
                    headerTitleStyle: {
                        color: theme.colors.text,
                    },
                    headerShadowVisible: transparent,
                    headerTransparent: true,
                    headerBlurEffect: UnistylesRuntime.themeName,
                }}
                component={component}
                initialParams={params}
            />
        </Stack.Navigator>
    )
}
const stylesheet = createStyleSheet((theme) => ({
    background: { backgroundColor: theme.colors.background },
    headerBackground: { backgroundColor: theme.colors.card },
}))
export default WorkaroundStack
