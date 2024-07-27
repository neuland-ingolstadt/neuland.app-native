import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { type Theme } from '@react-navigation/native'
import Color from 'color'
import { withLayoutContext } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Easing } from 'react-native'
import {
    type MaterialBottomTabNavigationOptions,
    createMaterialBottomTabNavigator, // @ts-expect-error no types
} from 'react-native-paper/react-navigation'

const { Navigator } = createMaterialBottomTabNavigator()
const MaterialBottomTabs = withLayoutContext<
    // @ts-expect-error Missing arguments in type
    MaterialBottomTabNavigationOptions,
    typeof Navigator
>(Navigator)

const MaterialTabs = ({ theme }: { theme: Theme }): JSX.Element => {
    const isDark = theme.dark
    const colors = theme.colors as Colors
    const { t } = useTranslation('navigation')

    return (
        <MaterialBottomTabs
            sceneAnimationEasing={Easing.ease}
            activeColor={colors.text}
            inactiveColor={colors.labelColor}
            activeIndicatorStyle={{
                backgroundColor: isDark
                    ? Color(colors.card)
                          .mix(Color(colors.primary), 0.06)
                          .lighten(1.4)
                          .saturate(1)
                          .hex()
                    : Color(colors.card)
                          .mix(Color(colors.primary), 0.3)
                          .darken(0.05)
                          .saturate(0.1)
                          .hex(),
            }}
            barStyle={{
                backgroundColor: isDark
                    ? Color(colors.card).mix(Color(colors.primary), 0.04).hex()
                    : Color(colors.card).mix(Color(colors.primary), 0.1).hex(),
            }}
            sceneContainerStyle={{
                backgroundColor: colors.background,
            }}
        >
            <MaterialBottomTabs.Screen
                name="(index)"
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'home',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'house',
                                size: 17,
                            }}
                            color={props.color}
                        />
                    ),
                }}
            />

            <MaterialBottomTabs.Screen
                name="(timetable)"
                options={{
                    title: 'Timetable',
                    tabBarLabel: t('navigation.timetable'),
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'calendar_month',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'calendar',
                                size: 17,
                            }}
                            color={props.color}
                        />
                    ),
                }}
            />

            <MaterialBottomTabs.Screen
                name="map"
                options={{
                    tabBarLabel: t('navigation.map'),
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'map',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'map',
                                size: 17,
                            }}
                            color={props.color}
                        />
                    ),
                }}
            />
            <MaterialBottomTabs.Screen
                name="(food)"
                options={{
                    tabBarLabel: t('navigation.food'),
                    tabBarIcon: (props: {
                        focused: boolean
                        color: string
                    }) => (
                        <PlatformIcon
                            android={{
                                name: 'fastfood',
                                size: 20,
                                variant: props.focused ? 'filled' : 'outlined',
                            }}
                            ios={{
                                name: 'fork.knife',
                                size: 17,
                            }}
                            color={props.color}
                        />
                    ),
                }}
            />
        </MaterialBottomTabs>
    )
}

export default MaterialTabs
