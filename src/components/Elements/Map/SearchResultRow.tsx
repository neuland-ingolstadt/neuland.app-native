import { MapContext } from '@/contexts/map'
import { type SearchResult } from '@/types/map'
import { getContrastColor } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'

const ResultRow: React.FC<{
    result: SearchResult
    index: number
    handlePresentModalPress: () => void
    updateSearchHistory: (result: SearchResult) => void
}> = ({
    result,
    index,
    handlePresentModalPress,
    updateSearchHistory,
}): JSX.Element => {
    const { setClickedElement, setLocalSearch, setCurrentFloor } =
        useContext(MapContext)
    const { styles } = useStyles(stylesheet)
    const { i18n } = useTranslation()
    const roomTypeKey = i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en'
    return (
        <TouchableOpacity
            key={index}
            style={styles.searchRowContainer}
            onPress={() => {
                const center = result.item.properties?.center
                updateSearchHistory(result)
                setClickedElement({
                    data: result.title,
                    type: result.item.properties?.rtype,
                    center,
                    manual: false,
                })
                setCurrentFloor({
                    floor: (result.item.properties?.Ebene as string) ?? 'EG',
                    manual: false,
                })
                trackEvent('Room', {
                    room: result.title,
                    origin: 'Search',
                })
                handlePresentModalPress()
                setLocalSearch('')
            }}
        >
            <View style={styles.searchIconContainer}>
                <PlatformIcon
                    ios={{
                        name: result.item.properties?.icon.ios,
                        size: 18,
                    }}
                    android={{
                        name: result.item.properties?.icon.android,
                        variant: 'outlined',
                        size: 21,
                    }}
                    style={styles.icon}
                />
            </View>

            <View style={styles.flex}>
                <Text style={styles.suggestionTitle}>{result.title}</Text>
                <Text style={styles.suggestionSubtitle}>
                    {result.item.properties?.[roomTypeKey] ?? result.subtitle}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    searchRowContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        alignItems: 'center',
    },
    searchIconContainer: {
        marginRight: 14,
        width: 40,
        height: 40,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
    },

    suggestionTitle: {
        fontWeight: '600',
        fontSize: 16,
        color: theme.colors.text,
    },
    suggestionSubtitle: {
        fontWeight: '400',
        fontSize: 14,
        maxWidth: '90%',
        color: theme.colors.text,
    },
    flex: {
        flex: 1,
    },
    icon: {
        color: getContrastColor(theme.colors.primary),
    },
}))
export default ResultRow
