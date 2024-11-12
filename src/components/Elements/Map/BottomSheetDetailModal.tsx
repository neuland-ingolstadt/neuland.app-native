import { type FormListSections } from '@/types/components'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import { PAGE_PADDING } from '@/utils/style-utils'
import { trackEvent } from '@aptabase/react-native'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import Color from 'color'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, Share, Text, View } from 'react-native'
import { type SharedValue } from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')

    return (
        <View style={styles.reportContainer}>
            <Pressable
                onPress={() => {
                    void Linking.openURL(t('pages.map.details.room.reportMail'))
                }}
                style={styles.reportLink}
            >
                <Text style={styles.reportText}>
                    {t('pages.map.details.room.report')}
                </Text>
                <PlatformIcon
                    style={styles.chevronIcon}
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
    const { styles } = useStyles(stylesheet)
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
                        <Text style={styles.modalSectionHeader}>
                            {roomData.title}
                        </Text>
                        <View style={styles.buttonsContainer}>
                            {roomData.type === SEARCH_TYPES.ROOM && (
                                <Pressable
                                    onPress={() => {
                                        handleShareModal(roomData.title)
                                    }}
                                    style={styles.roomDetailButton}
                                >
                                    <PlatformIcon
                                        ios={{
                                            name: 'square.and.arrow.up',
                                            size: 14,
                                            weight: 'bold',
                                        }}
                                        android={{
                                            name: 'share',
                                            size: 16,
                                        }}
                                        style={styles.shareIcon(Platform.OS)}
                                    />
                                </Pressable>
                            )}
                            <Pressable
                                onPress={() => {
                                    bottomSheetModalRef.current?.close()
                                }}
                            >
                                <View style={styles.roomDetailButton}>
                                    <PlatformIcon
                                        ios={{
                                            name: 'xmark',
                                            size: 13,
                                            weight: 'bold',
                                        }}
                                        android={{
                                            name: 'expand_more',
                                            size: 21,
                                        }}
                                        style={styles.xIcon(Platform.OS)}
                                    />
                                </View>
                            </Pressable>
                        </View>
                    </View>
                    <Text style={styles.roomSubtitle}>{roomData.subtitle}</Text>
                    <View style={styles.formList}>
                        <FormList sections={modalSection} />
                    </View>
                    <ReportLink />
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetModalProvider>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    reportContainer: { paddingVertical: 10 },
    reportLink: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    reportText: {
        fontSize: 15,
        paddingStart: 4,
        color: theme.colors.labelColor,
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
        color: theme.colors.text,
    },
    roomSubtitle: {
        fontSize: 16,
        color: theme.colors.text,
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
        backgroundColor: theme.colors.card,
    },
    buttonsContainer: { flexDirection: 'row', gap: 10, marginBottom: 3 },
    chevronIcon: {
        color: theme.colors.labelColor,
    },
    shareIcon: (platform) => ({
        color: Color(theme.colors.text).darken(0.1).hex(),
        marginRight: platform === 'android' ? 2 : 0,
        marginBottom: platform === 'ios' ? 3 : 0,
    }),
    xIcon: (platform) => ({
        color: Color(theme.colors.text).darken(0.1).hex(),
        marginRight: platform === 'android' ? 2 : 0,
        marginTop: platform === 'ios' ? 1 : 0,
    }),
}))
