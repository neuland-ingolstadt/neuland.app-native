import { type Colors } from '@/components/colors'
import { MapContext } from '@/contexts/map'
import { type SearchResult } from '@/types/map'
import { getContrastColor } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

const ResultRow: React.FC<{
    result: SearchResult
    index: number
    colors: Colors
    handlePresentModalPress: () => void
    bottomSheetRef: React.RefObject<any>
    updateSearchHistory: (result: SearchResult) => void
}> = ({
    result,
    index,
    colors,
    handlePresentModalPress,
    bottomSheetRef,
    updateSearchHistory,
}): JSX.Element => {
    const { setClickedElement, setLocalSearch, setCurrentFloor } =
        useContext(MapContext)
    const { i18n } = useTranslation()
    const roomTypeKey = i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en'
    return (
        <TouchableOpacity
            key={index}
            style={styles.searchRowContainer}
            onPress={() => {
                const center = result.item.properties?.center
                Keyboard.dismiss()
                bottomSheetRef.current?.collapse()
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
            <View
                style={{
                    ...styles.searchIconContainer,
                    backgroundColor: colors.primary,
                }}
            >
                <PlatformIcon
                    color={getContrastColor(colors.primary)}
                    ios={{
                        name: result.item.properties?.icon.ios,
                        size: 18,
                    }}
                    android={{
                        name: result.item.properties?.icon.android,
                        variant: 'outlined',
                        size: 21,
                    }}
                />
            </View>

            <View style={styles.flex}>
                <Text
                    style={{
                        color: colors.text,
                        ...styles.suggestionTitle,
                    }}
                >
                    {result.title}
                </Text>
                <Text
                    style={{
                        color: colors.text,
                        ...styles.suggestionSubtitle,
                    }}
                >
                    {result.item.properties?.[roomTypeKey] ?? result.subtitle}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
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
    },

    suggestionTitle: {
        fontWeight: '600',
        fontSize: 16,
    },
    suggestionSubtitle: {
        fontWeight: '400',
        fontSize: 14,
        maxWidth: '90%',
    },
    flex: {
        flex: 1,
    },
})
export default ResultRow
