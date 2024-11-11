import { RouteParamsContext } from '@/components/contexts'
import { type NormalizedLecturer } from '@/types/utils'
import { ROW_PADDING } from '@/utils/style-utils'
import { router } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import RowEntry from '../Universal/RowEntry'

const LecturerRow = ({ item }: { item: NormalizedLecturer }): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    const { updateRouteParams } = useContext(RouteParamsContext)

    const onPressRoom = (): void => {
        router.navigate('(tabs)/map')
        updateRouteParams(item.room_short ?? '')
    }
    const onPressRow = (): void => {
        router.navigate('lecturer')
        router.setParams({ lecturerEntry: JSON.stringify(item) })
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
        fontSize: 15,

        fontWeight: '500',
        marginBottom: 4,
        color: theme.colors.labelColor,
    },
    leftText2: {
        fontSize: 13,
        color: theme.colors.labelColor,
    },
    rightContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: ROW_PADDING,
    },
    rightText1: {
        fontSize: 14,
        fontWeight: '400',
        color: theme.colors.labelColor,
    },
    rightText2: {
        fontSize: 14,
        fontWeight: '400',
        color: theme.colors.primary,
    },
}))

export default LecturerRow
