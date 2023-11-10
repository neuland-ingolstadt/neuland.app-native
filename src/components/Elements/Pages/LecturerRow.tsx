import { type Colors } from '@/stores/colors'
import { type NormalizedLecturer } from '@/utils/lecturers-utils'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import RowEntry from '../Universal/RowEntry'

const LecturerRow = ({
    colors,
    item,
}: {
    colors: Colors

    item: NormalizedLecturer
}): JSX.Element => {
    const onPressRoom = (): void => {
        router.push('(tabs)/map')
        router.setParams({
            q: item.room_short,
            h: 'true',
        })
    }
    const onPressRow = (): void => {
        router.push({
            pathname: '(pages)/lecturer',
            params: { lecturerEntry: JSON.stringify(item) },
        })
    }
    const { t } = useTranslation('api')
    return (
        <RowEntry
            title={`${[item.titel, item.vorname, item.name].join(' ').trim()}`}
            colors={colors}
            leftChildren={
                <>
                    <Text
                        style={{
                            color: colors.labelColor,
                            ...styles.leftText1,
                        }}
                        numberOfLines={2}
                    >
                        {t(`lecturerFunctions.${item?.funktion}`, {
                            defaultValue: item?.funktion,
                            fallbackLng: 'de',
                        })}
                    </Text>
                    <Text
                        style={{
                            ...styles.leftText2,
                            color: colors.labelColor,
                        }}
                        numberOfLines={2}
                    >
                        {t(`lecturerOrganizations.${item?.organisation}`, {
                            defaultValue: item?.organisation,
                            fallbackLng: 'de',
                        })}
                    </Text>
                </>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        {item.raum !== null && item.raum !== '' && (
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={{
                                        ...styles.rightText1,
                                        color: colors.labelColor,
                                    }}
                                >
                                    {'Room: '}
                                </Text>
                                <Text
                                    style={{
                                        ...styles.rightText2,
                                        color: colors.primary,
                                    }}
                                    onPress={onPressRoom}
                                >
                                    {item.room_short}
                                </Text>
                            </View>
                        )}
                    </View>
                </>
            }
            onPress={onPressRow}
            maxTitleWidth={'75%'}
        />
    )
}

const styles = StyleSheet.create({
    leftText1: {
        fontSize: 15,

        fontWeight: '500',
        marginBottom: 4,
    },
    leftText2: {
        fontSize: 13,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 5,
    },
    rightText1: {
        fontSize: 14,
        fontWeight: '400',
    },
    rightText2: {
        fontSize: 14,
        fontWeight: '400',
    },
})

export default LecturerRow
