import { type Colors } from '@/components/colors'
import { type FormListSections } from '@/types/components'
import { type RoomData } from '@/types/map'
import { formatFriendlyTime } from '@/utils/date-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { type SharedValue } from 'react-native-reanimated'

import FormList from '../Universal/FormList'
import PlatformIcon from '../Universal/Icon'
import BottomSheetBackground from './BottomSheetBackground'

interface BottomSheetDetailModalProps {
    bottomSheetModalRef: React.RefObject<BottomSheetModal>
    handleSheetChangesModal: (index: number) => void
    currentPositionModal: SharedValue<number>
    roomData: any
    roomSection: FormListSections[]
}

/**
 * Formats the content of the room details section
 * @param {RoomData} roomData - Data for the room
 * @param {any} t - Translation function
 * @param {any} locations - Locations
 * @returns {FormListSections[]}
 * */
export const roomSection = (
    roomData: RoomData,
    locations: any
): FormListSections[] => {
    const { t } = useTranslation('common')

    return roomData.occupancies !== null || roomData.properties !== null
        ? [
              {
                  header: t('pages.map.details.room.availability'),
                  items:
                      roomData.occupancies == null
                          ? [
                                {
                                    title: t(
                                        'pages.map.details.room.available'
                                    ),
                                    value: t(
                                        'pages.map.details.room.notAvailable'
                                    ),
                                },
                            ]
                          : [
                                {
                                    title: t('pages.map.details.room.timeLeft'),
                                    value: (() => {
                                        const timeLeft =
                                            new Date(
                                                roomData.occupancies.until
                                            ).getTime() - new Date().getTime()
                                        const minutes = Math.floor(
                                            (timeLeft / 1000 / 60) % 60
                                        )
                                        const hours = Math.floor(
                                            (timeLeft / (1000 * 60 * 60)) % 24
                                        )
                                        const formattedMinutes =
                                            minutes < 10
                                                ? `0${minutes}`
                                                : minutes
                                        return `${hours}:${formattedMinutes}h`
                                    })(),
                                },
                                {
                                    title: t('pages.map.details.room.timeSpan'),
                                    value: `${formatFriendlyTime(
                                        roomData.occupancies.from
                                    )} - ${formatFriendlyTime(
                                        roomData.occupancies.until
                                    )}`,
                                },
                            ],
              },
              ...(roomData.properties !== null
                  ? [
                        {
                            header: t('pages.map.details.room.details'),
                            items: [
                                {
                                    title: t('pages.map.details.room.type'),
                                    value:
                                        roomData.properties.Funktion_en ??
                                        t('misc.unknown'),
                                },
                                ...(roomData.occupancies != null
                                    ? [
                                          {
                                              title: t(
                                                  'pages.map.details.room.capacity'
                                              ),
                                              value: `${roomData.occupancies.capacity} ${t('pages.rooms.options.seats')}`,
                                          },
                                      ]
                                    : []),
                                {
                                    title: t('pages.map.details.room.building'),
                                    value:
                                        roomData.properties.Gebaeude ??
                                        t('misc.unknown'),
                                },
                                {
                                    title: t('pages.map.details.room.floor'),
                                    value:
                                        roomData.properties.Ebene ??
                                        t('misc.unknown'),
                                },
                                {
                                    title: 'Campus',
                                    value:
                                        locations[
                                            roomData.properties.Standort
                                        ] ?? t('misc.unknown'),
                                },
                            ],
                        },
                    ]
                  : []),
          ]
        : []
}

/**
 * BottomSheetDetailModal component for displaying room details
 * @param {React.RefObject<BottomSheetModal>} bottomSheetModalRef - Reference to the bottom sheet modal
 * @param {Function} handleSheetChangesModal - Function to handle changes in the bottom sheet modal
 * @param {SharedValue<number>} currentPositionModal - Current position of the bottom sheet modal
 * @param {any} roomData - Data for the room
 * @param {FormListSections[]} roomSection - Sections for the room
 * @returns {JSX.Element}
 */
export const BottomSheetDetailModal = ({
    bottomSheetModalRef,
    handleSheetChangesModal,
    currentPositionModal,
    roomData,
    roomSection,
}: BottomSheetDetailModalProps): JSX.Element => {
    const colors = useTheme().colors as Colors

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
