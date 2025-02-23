import {
    type NativeBottomTabNavigationEventMap,
    type NativeBottomTabNavigationOptions,
    createNativeBottomTabNavigator,
} from '@bottom-tabs/react-navigation'
import type {
    ParamListBase,
    TabNavigationState,
} from '@react-navigation/native'
import { withLayoutContext } from 'expo-router'

const { Navigator } = createNativeBottomTabNavigator()

export const Tabs = withLayoutContext<
    NativeBottomTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    NativeBottomTabNavigationEventMap
>(Navigator)
