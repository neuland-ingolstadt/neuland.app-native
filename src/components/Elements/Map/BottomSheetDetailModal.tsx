import { type Colors } from '@/components/colors'
import { type FormListSections } from '@/types/components'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import { PAGE_PADDING } from '@/utils/style-utils'
import { trackEvent } from '@aptabase/react-native'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Linking,
    Platform,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { type SharedValue } from 'react-native-reanimated'

import FormList from '../Universal/FormList'
import PlatformIcon from '../Universal/Icon'
import BottomSheetBackground from './BottomSheetBackground'

interface BottomSheetDetailModalProps {
    bottomSheetModalRef: React.RefObject<BottomSheetModal>
    handleSheetChangesModal: () => void
    currentPositionModal: SharedValue<number>
    roomData: RoomData
    modalSection: FormListSections[]
}

const handleShareModal = (room: string): void => {
    const payload = 'https://neuland.app/rooms/?highlight=' + room
    trackEvent('Share', {
        type: 'room',
    })
    void Share.share(
        Platform.OS === 'android' ? { message: payload } : { url: payload }
    )
}

const ReportLink: React.FC = () => {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')

    return (
        <View style={styles.reportContainer}>
            <Pressable
                onPress={() => {
                    void Linking.openURL(t('pages.map.details.room.reportMail'))
                }}
                style={styles.reportLink}
            >
                <Text
                    style={{
                        color: colors.labelColor,
                        ...styles.reportText,
                    }}
                >
                    {t('pages.map.details.room.report')}
                </Text>
                <PlatformIcon
                    color={colors.labelColor}
                    ios={{
                        name: 'chevron.forward',
                        size: 11,
                    }}
                    android={{
                        name: 'chevron_right',
                        size: 16,
                    }}
                />
            </Pressable>
        </View>
    )
}

/**
 * BottomSheetDetailModal component for displaying room details
 * @param {React.RefObject<BottomSheetModal>} bottomSheetModalRef - Reference to the bottom sheet modal
 * @param {Function} handleSheetChangesModal - Function to handle changes in the bottom sheet modal
 * @param {any} roomData - Data for the room
 * @param {FormListSections[]} modalSection - Sections for the room
 * @returns {JSX.Element}
 */
export const BottomSheetDetailModal = ({
    bottomSheetModalRef,
    handleSheetChangesModal,
    currentPositionModal,
    roomData,
    modalSection,
}: BottomSheetDetailModalProps): JSX.Element => {
    const colors = useTheme().colors as Colors
    return (
        <BottomSheetModalProvider>
            <BottomSheetModal
                index={0}
                ref={bottomSheetModalRef}
                snapPoints={['30%', '45%', '70%']}
                onDismiss={handleSheetChangesModal}
                backgroundComponent={BottomSheetBackground}
                animatedPosition={currentPositionModal}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.modalSectionHeaderContainer}>
                        <Text
                            style={{
                                color: colors.text,
                                ...styles.modalSectionHeader,
                            }}
                        >
                            {roomData.title}
                        </Text>
                        <View style={styles.buttonsContainer}>
                            {roomData.type === SEARCH_TYPES.ROOM && (
                                <Pressable
                                    onPress={() => {
                                        handleShareModal(roomData.title)
                                    }}
                                    style={{
                                        backgroundColor: colors.card,
                                        ...styles.roomDetailButton,
                                    }}
                                >
                                    <PlatformIcon
                                        color={Color(colors.text)
                                            .darken(0.1)
                                            .hex()}
                                        ios={{
                                            name: 'square.and.arrow.up',
                                            size: 14,
                                            weight: 'bold',
                                        }}
                                        android={{
                                            name: 'share',
                                            size: 16,
                                        }}
                                        style={Platform.select({
                                            android: {
                                                marginRight: 2,
                                            },
                                            ios: {
                                                marginBottom: 3,
                                            },
                                        })}
                                    />
                                </Pressable>
                            )}
                            <Pressable
                                onPress={() => {
                                    bottomSheetModalRef.current?.close()
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: colors.card,
                                        ...styles.roomDetailButton,
                                    }}
                                >
                                    <PlatformIcon
                                        color={Color(colors.text)
                                            .darken(0.1)
                                            .hex()}
                                        ios={{
                                            name: 'xmark',
                                            size: 13,
                                            weight: 'bold',
                                        }}
                                        android={{
                                            name: 'expand_more',
                                            size: 21,
                                        }}
                                        style={Platform.select({
                                            android: {
                                                marginRight: 2,
                                            },
                                            ios: {
                                                marginTop: 1,
                                            },
                                        })}
                                    />
                                </View>
                            </Pressable>
                        </View>
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
                        <FormList sections={modalSection} />
                    </View>
                    <ReportLink />
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetModalProvider>
    )
}

const styles = StyleSheet.create({
    reportContainer: { paddingVertical: 10 },
    reportLink: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    reportText: {
        fontSize: 15,
        paddingStart: 4,
    },
    formList: {
        marginVertical: 16,
        width: '100%',
        alignSelf: 'center',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: PAGE_PADDING,
    },
    modalSectionHeader: {
        fontWeight: '600',
        fontSize: 26,
        textAlign: 'left',
    },
    roomSubtitle: {
        fontSize: 16,
    },
    modalSectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 0,
    },
    roomDetailButton: {
        borderRadius: 25,
        padding: 7,
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonsContainer: { flexDirection: 'row', gap: 10, marginBottom: 3 },
})
