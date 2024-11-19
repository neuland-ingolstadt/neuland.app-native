import { type NormalizedLecturer } from '@/types/utils'
import { Buffer } from 'buffer/'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import RowEntry from '../Universal/RowEntry'

const LecturerRow = ({ item }: { item: NormalizedLecturer }): JSX.Element => {
    const { styles } = useStyles(stylesheet)

    const onPressRoom = (): void => {
        router.dismissTo({
            pathname: '(tabs)/map',
            params: { room: item.room_short ?? '' },
        })
    }
    const onPressRow = (): void => {
        const base64Event = Buffer.from(JSON.stringify(item)).toString('base64')
        router.navigate({
            pathname: 'lecturer',
            params: { lecturerEntry: base64Event },
        })
    }
    const { t } = useTranslation('api')

    return (
        <RowEntry
            title={`${[item.titel, item.vorname, item.name].join(' ').trim()}`}
            leftChildren={
                <>
                    <Text style={styles.leftText1} numberOfLines={2}>
                        {t(`lecturerFunctions.${item?.funktion}`, {
                            defaultValue: item?.funktion,
                            fallbackLng: 'de',
                        })}
                    </Text>
                    <Text style={styles.leftText2} numberOfLines={2}>
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
                                <Text style={styles.rightText1}>
                                    {t('pages.lecturer.contact.room', {
                                        ns: 'common',
                                    })}
                                    {': '}
                                </Text>
                                <Text
                                    style={styles.rightText2}
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

const stylesheet = createStyleSheet((theme) => ({
    container: { flexDirection: 'row' },
    leftText1: {
        color: theme.colors.labelColor,

        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    leftText2: {
        color: theme.colors.labelColor,
        fontSize: 13,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: theme.margins.rowPadding,
    },
    rightText1: {
        color: theme.colors.labelColor,
        fontSize: 14,
        fontWeight: '400',
    },
    rightText2: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '400',
    },
}))

export default LecturerRow
