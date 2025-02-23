import { type FormListSections } from '@/types/components'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import { trackEvent } from '@aptabase/react-native'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import Color from 'color'
import { router } from 'expo-router'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Share, Text, View } from 'react-native'
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

interface ReportLinkProps {
    roomTitle: string
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

const ReportLink = ({ roomTitle }: ReportLinkProps): React.JSX.Element => {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')

    const handleReportRoom = useCallback(() => {
        router.push({
            pathname: '/room-report',
            params: { room: roomTitle },
        })
    }, [roomTitle])

    return (
        <View style={styles.reportContainer}>
            <Pressable
                onPress={() => handleReportRoom()}
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
                    web={{
                        name: 'ChevronRight',
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
}: BottomSheetDetailModalProps): React.JSX.Element => {
    const { styles } = useStyles(stylesheet)
    const IOS_SNAP_POINTS = ['36%', '55%', '80%']
    const DEFAULT_SNAP_POINTS = ['30%', '40%', '70%']
    return (
        <BottomSheetModalProvider>
            <BottomSheetModal
                index={0}
                ref={bottomSheetModalRef}
                snapPoints={
                    Platform.OS === 'ios'
                        ? IOS_SNAP_POINTS
                        : DEFAULT_SNAP_POINTS
                }
                onDismiss={handleSheetChangesModal}
                backgroundComponent={BottomSheetBackground}
                animatedPosition={currentPositionModal}
                handleIndicatorStyle={styles.indicator}
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
                                        web={{
                                            name: 'Share',
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
                                            size: 22,
                                        }}
                                        web={{
                                            name: 'X',
                                            size: 22,
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
                    <ReportLink roomTitle={roomData.title} />
                </BottomSheetView>
            </BottomSheetModal>
        </BottomSheetModalProvider>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    buttonsContainer: { flexDirection: 'row', gap: 10, marginBottom: 3 },
    chevronIcon: {
        color: theme.colors.labelColor,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: theme.margins.page,
    },
    formList: {
        alignSelf: 'center',
        marginVertical: 16,
        width: '100%',
    },
    indicator: {
        backgroundColor: theme.colors.labelTertiaryColor,
    },
    modalSectionHeader: {
        color: theme.colors.text,
        fontSize: 26,
        fontWeight: '600',
        textAlign: 'left',
    },
    modalSectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 0,
    },
    reportContainer: { paddingVertical: 10 },
    reportLink: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    reportText: {
        color: theme.colors.labelColor,
        fontSize: 15,
        paddingStart: 4,
    },
    roomDetailButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: 25,
        height: 34,
        justifyContent: 'center',
        padding: 7,
        width: 34,
    },
    roomSubtitle: {
        color: theme.colors.text,
        fontSize: 16,
    },
    shareIcon: (platform) => ({
        color: Color(theme.colors.text).darken(0.1).hex(),
        marginRight: platform === 'android' ? 2 : 0,
        marginBottom: platform === 'ios' ? 3 : 0,
    }),
    xIcon: (platform) => ({
        color: Color(theme.colors.text).darken(0.1).hex(),
        marginTop: platform === 'ios' ? 1 : 0,
    }),
}))
