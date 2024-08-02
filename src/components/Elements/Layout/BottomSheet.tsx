import { type ParamListBase } from '@react-navigation/native'
import {
    type BottomSheetNavigationEventMap,
    type BottomSheetNavigationOptions,
    type BottomSheetNavigationState,
    createBottomSheetNavigator,
} from '@th3rdwave/react-navigation-bottom-sheet'
import { withLayoutContext } from 'expo-router'

const { Navigator } = createBottomSheetNavigator()

const BottomSheet = withLayoutContext<
    BottomSheetNavigationOptions,
    typeof Navigator,
    BottomSheetNavigationState<ParamListBase>,
    BottomSheetNavigationEventMap
>(Navigator)

export default BottomSheet
