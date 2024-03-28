import { type Colors } from '@/components/colors'
import { RouteParamsContext } from '@/components/contexts'
import { type NormalizedLecturer } from '@/types/utils'
import { ROW_PADDING } from '@/utils/style-utils'
import { router } from 'expo-router'
import React, { useContext } from 'react'
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
    const { updateRouteParams } = useContext(RouteParamsContext)

    const onPressRoom = (): void => {
        router.navigate('(tabs)/map')
        updateRouteParams(item.room_short ?? '')
    }
    const onPressRow = (): void => {
        router.push('(pages)/lecturer')
        router.setParams({ lecturerEntry: JSON.stringify(item) })
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
                        {item?.organisation !== null &&
                            t(`lecturerOrganizations.${item?.organisation}`, {
                                defaultValue: item?.organisation,
                                fallbackLng: 'de',
                            })}
                    </Text>
                </>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        {item.room_short !== null && item.room_short !== '' && (
                            <View style={styles.container}>
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
    container: { flexDirection: 'row' },
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
        padding: ROW_PADDING,
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
