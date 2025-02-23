import type { Grade } from '@/types/thi-api'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import RowEntry from '../Universal/RowEntry'

const GradesRow = ({ item }: { item: Grade }): React.JSX.Element => {
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
            rightChildren=<View style={styles.rightContainer}>
                {item.note !== null && item.note !== '' && (
                    <View style={styles.rightInnerContainer}>
                        <Text style={styles.rightText1}>{item.note}</Text>
                        <Text style={styles.rightText2}>
                            {t('grades.grade')}
                        </Text>
                    </View>
                )}
            </View>
            maxTitleWidth={'75%'}
        />
    )
}

const stylesheet = createStyleSheet((theme) => ({
    leftContainer: { paddingTop: 3 },
    leftText1: {
        color: theme.colors.labelColor,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: theme.margins.rowPadding,
    },
    rightInnerContainer: {
        alignItems: 'flex-end',
        flexDirection: 'column',
        gap: 5,
    },
    rightText1: {
        color: theme.colors.labelColor,
        fontSize: 20,
        fontWeight: '500',
    },
    rightText2: {
        color: theme.colors.labelSecondaryColor,
        fontSize: 14,
        fontWeight: '400',
    },
}))

export default GradesRow
