import {
    NativeBottomTabNavigationEventMap,
    NativeBottomTabNavigationOptions,
    createNativeBottomTabNavigator,
} from '@bottom-tabs/react-navigation'
import { ParamListBase, TabNavigationState } from '@react-navigation/native'
import { withLayoutContext } from 'expo-router'

const { Navigator } = createNativeBottomTabNavigator()

export const Tabs = withLayoutContext<
    NativeBottomTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    NativeBottomTabNavigationEventMap
>(Navigator)
