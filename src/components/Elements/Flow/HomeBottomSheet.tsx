import { PAGE_PADDING } from '@/utils/style-utils'
import { type BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface BottomSheetDetailModalProps {
    bottomSheetModalRef: React.RefObject<BottomSheetModal>
}

/**
 * BottomSheetDetailModal component for displaying room details
 * @param {React.RefObject<BottomSheetModal>} bottomSheetModalRef - Reference to the bottom sheet modal
 * @param {Function} handleSheetChangesModal - Function to handle changes in the bottom sheet modal
 * @param {SharedValue<number>} currentPositionModal - Current position of the bottom sheet modal
 * @param {any} roomData - Data for the room
 * @param {FormListSections[]} modalSection - Sections for the room
 * @returns {JSX.Element}
 */
export const HomeBottomSheet = ({
    bottomSheetModalRef,
}: BottomSheetDetailModalProps): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    return (
        <BottomSheetView style={styles.contentContainer}>
            <View>
                <Text style={styles.text}>{'Report a problem'}</Text>
            </View>
        </BottomSheetView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    contentContainer: {
        flex: 1,
        paddingHorizontal: PAGE_PADDING,
    },
    text: {
        fontSize: 21,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
}))
