import { withLayoutContext } from 'expo-router'
import {
    type MaterialBottomTabNavigationOptions,
    createMaterialBottomTabNavigator,
} from 'react-native-paper/react-navigation'

const { Navigator } = createMaterialBottomTabNavigator()

export const MaterialBottomTabs = withLayoutContext<
    // @ts-expect-error Missing arguments in type
    MaterialBottomTabNavigationOptions,
    typeof Navigator
>(Navigator)
