import { type Colors } from '@/stores/colors'
import { type Grade } from '@customTypes/thi-api'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import RowEntry from '../Universal/RowEntry'

const GradesRow = ({
    colors,
    item,
}: {
    colors: Colors

    item: Grade
}): JSX.Element => {
    const { t } = useTranslation('common')
    return (
        <RowEntry
            title={item.titel}
            colors={colors}
            leftChildren={
                <View style={{ paddingTop: 3 }}>
                    <Text
                        style={{
                            color: colors.labelColor,
                            ...styles.leftText1,
                        }}
                        numberOfLines={2}
                    >
                        ECTS: {item.ects ?? t('grades.none')}
                    </Text>
                </View>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        {item.note !== null && item.note !== '' && (
                            <View
                                style={{
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: 5,
                                }}
                            >
                                <Text
                                    style={{
                                        ...styles.rightText1,
                                        color: colors.labelColor,
                                    }}
                                >
                                    {item.note}
                                </Text>
                                <Text
                                    style={{
                                        ...styles.rightText2,
                                        color: colors.labelSecondaryColor,
                                    }}
                                >
                                    {t('pages.grades.grade')}
                                </Text>
                            </View>
                        )}
                    </View>
                </>
            }
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
        fontSize: 20,
        fontWeight: '500',
    },
    rightText2: {
        fontSize: 14,
        fontWeight: '400',
    },
})

export default GradesRow
