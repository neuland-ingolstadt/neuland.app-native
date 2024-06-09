import { type Colors } from '@/components/colors'
import { PAGE_PADDING } from '@/utils/style-utils'
import { type BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

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
    const colors = useTheme().colors as Colors
    return (
        <BottomSheetView style={styles.contentContainer}>
            <View>
                <Text
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{
                        fontSize: 21,
                        fontWeight: 'bold',
                        color: colors.text,
                    }}
                >
                    coming soon
                </Text>
            </View>
        </BottomSheetView>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        paddingHorizontal: PAGE_PADDING,
    },
})
