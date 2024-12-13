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
 * This is a generic stack used as workaround for missing or broken features in expo-router or bottom-tabs.
 * It can be used as a drop-in replacement for the native stack navigator.
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
