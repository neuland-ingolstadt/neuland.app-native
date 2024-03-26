import PlatformIcon from '@/components/Elements/Universal/Icon'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors, accentColors } from '@/components/colors'
import { AppIconContext, ThemeContext } from '@/components/contexts'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Image,
    type ImageProps,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

let iconImages: Record<string, ImageProps> = {}

if (Platform.OS === 'ios') {
    iconImages = {
        default: require('@/assets/appIcons/default.png'),
        modernDark: require('@/assets/appIcons/modernDark.png'),
        modernLight: require('@/assets/appIcons/modernLight.png'),
        modernPink: require('@/assets/appIcons/modernPink.png'),
        modernGreen: require('@/assets/appIcons/modernGreen.png'),
        rainbowDark: require('@/assets/appIcons/rainbowDark.png'),
        rainbowNeon: require('@/assets/appIcons/rainbowNeon.png'),
        rainbowMoonLight: require('@/assets/appIcons/rainbowMoonLight.png'),
        cat: require('@/assets/appIcons/cat.png'),
    }
}

export default function Theme(): JSX.Element {
    const colors = useTheme().colors as Colors
    const deviceTheme = useTheme()
    const { accentColor, toggleAccentColor } = useContext(ThemeContext)
    const { appIcon } = useContext(AppIconContext)
    const { t } = useTranslation(['settings'])

    interface ColorBoxColor {
        light: string
        dark: string
    }

    const ColorBox = ({
        color,
        code,
    }: {
        color: ColorBoxColor
        code: string
    }): JSX.Element => {
        const themeAccentColor = deviceTheme.dark ? color.dark : color.light
        return (
            <View style={styles.colorBoxContainer}>
                <Pressable
                    onPress={() => {
                        toggleAccentColor(code)
                        if (Platform.OS === 'ios') {
                            void Haptics.selectionAsync()
                        }
                    }}
                    style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.8 : 1,
                            marginHorizontal: 15,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.colorBox,
                            {
                                backgroundColor: themeAccentColor,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        {accentColor === code && (
                            <PlatformIcon
                                color={getContrastColor(themeAccentColor)}
                                ios={{
                                    name: 'checkmark',
                                    size: 20,
                                }}
                                android={{
                                    name: 'check',
                                    size: 24,
                                }}
                            />
                        )}
                    </View>
                </Pressable>
                <Text
                    style={{
                        color: colors.text,
                        ...styles.colorBoxText,
                    }}
                >
                    {/* @ts-expect-error cannot verify that code is a valid key */}
                    {t(`theme.colors.${code}`)}
                </Text>
            </View>
        )
    }

    interface ColorBoxMatrixProps {
        colors: Array<{
            code: string
            color: ColorBoxColor
        }>
    }

    const ColorBoxMatrix = ({ colors }: ColorBoxMatrixProps): JSX.Element => {
        return (
            <View style={styles.colorMatrixContainer}>
                {colors.map((color, index) => (
                    <ColorBox
                        color={color.color}
                        code={color.code}
                        key={index}
                    />
                ))}
            </View>
        )
    }

    const colorRows = Array.from({ length: 3 }, (_, rowIndex) =>
        Object.entries(accentColors)
            .slice(rowIndex * 3, (rowIndex + 1) * 3)
            .map(([key, value]) => ({
                code: key,
                color: value,
            }))
    )

    return (
        <>
            <ScrollView>
                <SectionView
                    title={t('theme.accent.title')}
                    footer={t('theme.footer')}
                >
                    <View
                        style={[
                            styles.sectionContainer,
                            {
                                backgroundColor: colors.card,
                            },
                        ]}
                    >
                        {colorRows.map((rowColors, index) => (
                            <ColorBoxMatrix colors={rowColors} key={index} />
                        ))}
                    </View>
                </SectionView>
                {Platform.OS === 'ios' && (
                    <SectionView title="App Icon">
                        <Pressable
                            style={[
                                styles.sectionContainer,
                                styles.iconPressable,
                                {
                                    backgroundColor: colors.card,
                                },
                            ]}
                            onPress={() => {
                                router.push('(user)/appicon')
                            }}
                        >
                            <View style={styles.iconInnerContainer}>
                                <Image
                                    source={iconImages[appIcon]}
                                    style={{
                                        ...styles.iconContainer,
                                        borderColor: colors.border,
                                    }}
                                />
                                <Text
                                    style={{
                                        color: colors.text,
                                        ...styles.iconText,
                                    }}
                                >
                                    {/* @ts-expect-error cannot verify that appIcon is a valid key */}
                                    {t(`appIcon.names.${appIcon}`)}
                                </Text>
                            </View>
                            <PlatformIcon
                                color={colors.labelSecondaryColor}
                                ios={{
                                    name: 'chevron.forward',
                                    size: 20,
                                }}
                                android={{
                                    name: 'chevron_right',
                                    size: 26,
                                }}
                            />
                        </Pressable>
                    </SectionView>
                )}
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    colorBox: {
        width: 60,
        height: 60,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flexDirection: 'row',
        borderWidth: 2,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    sectionContainer: {
        borderRadius: 8,
        alignContent: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        flexWrap: 'wrap',
        paddingVertical: 18,
    },
    iconText: {
        fontSize: 18,
        alignSelf: 'center',
    },
    iconPressable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingStart: 12,
        paddingEnd: 18,
        paddingVertical: 12,
    },
    iconInnerContainer: { flexDirection: 'row', gap: 20 },
    iconContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        borderRadius: 18,
        borderWidth: 1,
    },
    colorBoxContainer: {
        justifyContent: 'center',
    },
    colorBoxText: {
        textAlign: 'center',
        paddingTop: 4,
    },
    colorMatrixContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 2,
        paddingVertical: 4,
    },
})
