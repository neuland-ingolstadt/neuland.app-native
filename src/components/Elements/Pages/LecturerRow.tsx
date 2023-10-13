import { type Colors } from '@/stores/colors'
import { type NormalizedLecturer } from '@/utils/lecturers-utils'
import { router } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

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
    return (
        <RowEntry
            title={`${[item.titel, item.vorname, item.name].join(' ').trim()}`}
            colors={colors}
            leftChildren={
                <>
                    <Text
                        style={{
                            fontSize: 15,
                            color: colors.labelColor,
                            fontWeight: '500',
                            marginBottom: 4,
                        }}
                        numberOfLines={2}
                    >
                        {item.funktion}
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
                            color: colors.labelColor,
                        }}
                        numberOfLines={2}
                    >
                        {item.organisation}
                    </Text>
                </>
            }
            rightChildren={
                <>
                    <View
                        style={{
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: 5,
                        }}
                    >
                        {item.raum !== null && item.raum !== '' && (
                            <View style={{ flexDirection: 'row' }}>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '400',
                                        color: colors.labelColor,
                                    }}
                                >
                                    {'Room: '}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '400',
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
        />
    )
}

export default LecturerRow
