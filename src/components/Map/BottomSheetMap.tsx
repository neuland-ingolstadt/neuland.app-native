/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { MapContext } from '@/contexts/map'
import BottomSheet from '@gorhom/bottom-sheet'
import Color from 'color'
import { type FeatureCollection } from 'geojson'
import React, { useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { TextInput } from 'react-native'
import Animated, { type SharedValue } from 'react-native-reanimated'
import {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

import AttributionLink from './AttributionLink'
import AvailableRoomsSuggestions from './AvailableRoomsSuggestions'
import BottomSheetBackground from './BottomSheetBackground'
import NextLectureSuggestion from './NextLectureSuggestion'
import SearchHistory from './SearchHistory'
import SearchResults from './SearchResuts'

interface MapBottomSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet>
    currentPosition: SharedValue<number>
    handlePresentModalPress: () => void
    allRooms: FeatureCollection
}

const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
    bottomSheetRef,
    currentPosition,
    handlePresentModalPress,
    allRooms,
}) => {
    const { styles, theme } = useStyles(stylesheet)
    const { t } = useTranslation('common')
    const { localSearch, setLocalSearch, searchHistory } =
        useContext(MapContext)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textInputRef = useRef<any>(null)
    const [searchFocused, setSearchFocused] = React.useState(false)
    const cancelWidth = useSharedValue(0)
    const cancelOpacity = useSharedValue(0)

    const animatedCancelStyle = useAnimatedStyle(() => ({
        width: cancelWidth.value,
        opacity: cancelOpacity.value,
    }))

    const animate = (toValue: number): void => {
        cancelWidth.value = withTiming(toValue, { duration: 200 })
        cancelOpacity.value = withTiming(toValue === 0 ? 0 : 1, {
            duration: 250,
        })
    }

    const width = t('misc.cancel').length * 11
    const IOS_SNAP_POINTS = ['20%', '38%', '87%']
    const DEFAULT_SNAP_POINTS = ['10%', '30%', '92%']
    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={1}
            snapPoints={
                Platform.OS === 'ios' ? IOS_SNAP_POINTS : DEFAULT_SNAP_POINTS
            }
            backgroundComponent={BottomSheetBackground}
            animatedPosition={currentPosition}
            keyboardBehavior="extend"
            onChange={(index) => {
                if (index <= 1) {
                    if (localSearch !== '') {
                        setLocalSearch('')
                    }
                    textInputRef.current?.blur()
                }
            }}
            enableDynamicSizing={false}
            handleIndicatorStyle={styles.indicator}
        >
            <View style={styles.page}>
                <View style={styles.inputContainer}>
                    <TextInput
                        ref={textInputRef}
                        style={styles.textInput}
                        placeholder={t('pages.map.search.hint')}
                        placeholderTextColor={theme.colors.labelColor}
                        value={localSearch}
                        enablesReturnKeyAutomatically
                        clearButtonMode="always"
                        enterKeyHint="search"
                        onChangeText={(text) => {
                            setLocalSearch(text)
                        }}
                        onFocus={() => {
                            setSearchFocused(true)
                            animate(width)
                            bottomSheetRef.current?.expand()
                        }}
                        onBlur={() => {
                            setSearchFocused(false)
                            animate(0)
                        }}
                    />

                    <Animated.View
                        style={[styles.cancelContainer, animatedCancelStyle]}
                    >
                        <Pressable
                            onPress={() => {
                                setLocalSearch('')
                                textInputRef.current?.blur()
                                bottomSheetRef.current?.snapToIndex(1)
                            }}
                            style={styles.cancelButton}
                        >
                            <Text
                                style={styles.cancelButtonText}
                                numberOfLines={1}
                                allowFontScaling={false}
                                ellipsizeMode="clip"
                            >
                                {t('misc.cancel')}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>

                {searchFocused &&
                    localSearch === '' &&
                    searchHistory.length !== 0 && (
                        <SearchHistory
                            handlePresentModalPress={handlePresentModalPress}
                        />
                    )}

                {searchFocused && localSearch === '' && (
                    <Text style={styles.searchHint}>
                        {t('pages.map.search.placeholder')}
                    </Text>
                )}

                {localSearch !== '' ? (
                    <SearchResults
                        handlePresentModalPress={handlePresentModalPress}
                        allRooms={allRooms}
                    />
                ) : searchFocused ? null : (
                    <>
                        <NextLectureSuggestion
                            allRooms={allRooms}
                            handlePresentModalPress={handlePresentModalPress}
                        />
                        <AvailableRoomsSuggestions
                            allRooms={allRooms}
                            handlePresentModalPress={handlePresentModalPress}
                        />
                        <AttributionLink />
                    </>
                )}
            </View>
        </BottomSheet>
    )
}

export default MapBottomSheet

const stylesheet = createStyleSheet((theme) => ({
    cancelButton: {
        alignSelf: 'center',
        paddingLeft: 10,

        paddingRight: 2,
    },
    cancelButtonText: {
        color: theme.colors.primary,
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    cancelContainer: { justifyContent: 'center' },
    indicator: {
        backgroundColor: theme.colors.labelTertiaryColor,
    },

    inputContainer: {
        flexDirection: 'row',
        height: 40,
        marginBottom: 10,
    },
    page: {
        paddingHorizontal: theme.margins.page,
    },

    searchHint: {
        color: theme.colors.labelColor,
        fontSize: 16,
        paddingTop: 60,
        paddingVertical: 30,
        textAlign: 'center',
    },

    textInput: {
        backgroundColor:
            UnistylesRuntime.themeName === 'dark'
                ? Color(theme.colors.card)
                      .lighten(Platform.OS === 'ios' ? 0.3 : 0.1)
                      .hex()
                : Color(theme.colors.card)
                      .darken(Platform.OS === 'ios' ? 0.03 : 0.01)
                      .hex(),
        borderRadius: theme.radius.mg,
        color: theme.colors.text,
        flex: 1,
        fontSize: 17,
        height: 40,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
}))
