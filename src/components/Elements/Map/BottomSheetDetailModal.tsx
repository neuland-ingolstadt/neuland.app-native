import { type Colors } from '@/components/colors'
import { type FormListSections } from '@/types/components'
import { PAGE_PADDING } from '@/utils/style-utils'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { type SharedValue } from 'react-native-reanimated'

import FormList from '../Universal/FormList'
import PlatformIcon from '../Universal/Icon'
import BottomSheetBackground from './BottomSheetBackground'

interface BottomSheetDetailModalProps {
    bottomSheetModalRef: React.RefObject<BottomSheetModal>
    handleSheetChangesModal: (index: number) => void
    currentPositionModal: SharedValue<number>
    colors: Colors
    roomData: any
    roomSection: FormListSections[]
}

export const BottomSheetDetailModal = ({
    bottomSheetModalRef,
    handleSheetChangesModal,
    currentPositionModal,
    colors,
    roomData,
    roomSection,
}: BottomSheetDetailModalProps): JSX.Element => {
    return (
        <BottomSheetModalProvider>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={['30%', '47%', '60%']}
                onChange={handleSheetChangesModal}
                backgroundComponent={BottomSheetBackground}
                animatedPosition={currentPositionModal}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.roomSectionHeaderContainer}>
                        <Text
                            style={{
                                color: colors.text,
                                ...styles.roomSectionHeader,
                            }}
                        >
                            {roomData.title}
                        </Text>
                        <Pressable
                            onPress={() => {
                                bottomSheetModalRef.current?.close()
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    ...styles.roomDismissButton,
                                }}
                            >
                                <PlatformIcon
                                    color={colors.text}
                                    ios={{
                                        name: 'chevron.down',
                                        size: 14,
                                    }}
                                    android={{
                                        name: 'expand_more',
                                        size: 24,
                                    }}
                                    style={Platform.select({
                                        android: {
                                            height: 24,
                                            width: 24,
                                        },
                                    })}
                                />
                            </View>
                        </Pressable>
                    </View>
                    <Text
                        style={{
                            color: colors.text,
                            ...styles.roomSubtitle,
                        }}
                    >
                        {roomData.subtitle}
                    </Text>
                    <View style={styles.formList}>
                        <FormList sections={roomSection} />
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetModalProvider>
    )
}

const styles = StyleSheet.create({
    formList: {
        marginVertical: 16,
        width: '100%',
        alignSelf: 'center',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: PAGE_PADDING,
    },
    roomSectionHeader: {
        fontWeight: '600',
        fontSize: 24,
        marginBottom: 4,
        textAlign: 'left',
    },
    roomSubtitle: {
        fontSize: 16,
    },
    roomSectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    roomDismissButton: {
        borderRadius: 25,
        padding: 7,
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
