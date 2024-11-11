import { type Grade } from '@/types/thi-api'
import { ROW_PADDING } from '@/utils/style-utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import RowEntry from '../Universal/RowEntry'

const GradesRow = ({ item }: { item: Grade }): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('settings')
    if (item.titel === null || item.titel === '') {
        return <></>
    }

    return (
        <RowEntry
            title={item.titel}
            leftChildren={
                <View style={styles.leftContainer}>
                    <Text style={styles.leftText1} numberOfLines={2}>
                        {'ECTS: '}
                        {item.ects ?? t('grades.none')}
                    </Text>
                </View>
            }
            rightChildren={
                <>
                    <View style={styles.rightContainer}>
                        {item.note !== null && item.note !== '' && (
                            <View style={styles.rightInnerContainer}>
                                <Text style={styles.rightText1}>
                                    {item.note}
                                </Text>
                                <Text style={styles.rightText2}>
                                    {t('grades.grade')}
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

const stylesheet = createStyleSheet((theme) => ({
    leftContainer: { paddingTop: 3 },
    leftText1: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
        color: theme.colors.labelColor,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: ROW_PADDING,
    },
    rightInnerContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 5,
    },
    rightText1: {
        fontSize: 20,
        fontWeight: '500',
        color: theme.colors.labelColor,
    },
    rightText2: {
        fontSize: 14,
        fontWeight: '400',
        color: theme.colors.labelSecondaryColor,
    },
}))

export default GradesRow
