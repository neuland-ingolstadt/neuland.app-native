import { MapContext } from '@/contexts/map'
import { type SearchResult } from '@/types/map'
import { selectionAsync } from 'expo-haptics'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutAnimation, Platform, Pressable, Text, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import Divider from '../Universal/Divider'
import PlatformIcon from '../Universal/Icon'
import ResultRow from './SearchResultRow'

interface SearchHistoryProps {
    handlePresentModalPress: () => void
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
    handlePresentModalPress,
}) => {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')
    const { searchHistory, updateSearchHistory } = useContext(MapContext)

    function addToSearchHistory(newHistory: SearchResult): void {
        const newSearchHistory = searchHistory.filter(
            (history) => history.title !== newHistory.title
        )

        newSearchHistory.unshift(newHistory)

        if (newSearchHistory.length > 5) {
            newSearchHistory.length = 5
        }

        updateSearchHistory(newSearchHistory)
    }

    function deleteSearchHistoryItem(element: SearchResult): void {
        const newSearchHistory = searchHistory.filter(
            (history) => history.title !== element.title
        )
        updateSearchHistory(newSearchHistory)
    }
    return (
        <>
            <View style={styles.suggestionContainer}>
                <View style={styles.suggestionSectionHeaderContainer}>
                    <Text style={styles.suggestionSectionHeader}>
                        {t('pages.map.details.room.history')}
                    </Text>
                </View>
                <View style={styles.radius}>
                    {searchHistory?.map((history, index) => (
                        <React.Fragment key={history.title}>
                            <Swipeable
                                renderRightActions={() => (
                                    <Pressable
                                        style={styles.swipeableActionContainer}
                                        onPress={() => {
                                            LayoutAnimation.configureNext(
                                                LayoutAnimation.Presets
                                                    .easeInEaseOut
                                            )
                                            if (Platform.OS === 'ios') {
                                                void selectionAsync()
                                            }
                                            deleteSearchHistoryItem(history)
                                        }}
                                    >
                                        <PlatformIcon
                                            ios={{
                                                name: 'trash',
                                                size: 20,
                                            }}
                                            android={{
                                                name: 'delete',
                                                size: 24,
                                            }}
                                            style={styles.toast}
                                        />
                                    </Pressable>
                                )}
                            >
                                <View style={styles.historyRow}>
                                    <ResultRow
                                        result={history}
                                        index={index}
                                        handlePresentModalPress={
                                            handlePresentModalPress
                                        }
                                        updateSearchHistory={addToSearchHistory}
                                    />
                                </View>
                            </Swipeable>
                            {index !== searchHistory.length - 1 && (
                                <Divider key={`divider-${index}`} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            </View>
        </>
    )
}

export default SearchHistory

const stylesheet = createStyleSheet((theme) => ({
    historyRow: {
        backgroundColor: theme.colors.card,
        paddingHorizontal: 12,
        paddingVertical: 3,
        width: '100%',
    },

    radius: {
        borderRadius: 14,
        overflow: 'hidden',
    },

    suggestionContainer: {
        marginBottom: 10,
    },

    suggestionSectionHeader: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 2,
        paddingTop: 8,
        textAlign: 'left',
    },
    suggestionSectionHeaderContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },

    swipeableActionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
    },

    toast: {
        color: theme.colors.notification,
    },
}))
