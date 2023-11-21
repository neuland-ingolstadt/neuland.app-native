import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors, accentColors } from '@/components/colors'
import { AppIconContext, ThemeContext } from '@/components/provider'
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

const iconImages: Record<string, ImageProps> = {
    default: require('@/assets/appIcons/default.png'),
    dark: require('@/assets/appIcons/dark.png'),
    light: require('@/assets/appIcons/light.png'),
    green: require('@/assets/appIcons/green.png'),
    greenNeon: require('@/assets/appIcons/greenNeon.png'),
    whiteNeon: require('@/assets/appIcons/whiteNeon.png'),
    rainbowNeon: require('@/assets/appIcons/rainbowNeon.png'),
    rainbowLight: require('@/assets/appIcons/rainbowLight.png'),
    rainbowDark: require('@/assets/appIcons/rainbowDark.png'),
    moonRainbowLight: require('@/assets/appIcons/moonRainbowLight.png'),
    moonRainbowDark: require('@/assets/appIcons/moonRainbowDark.png'),
    water: require('@/assets/appIcons/water.png'),
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
            <View
                style={{
                    justifyContent: 'center',
                }}
            >
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
                        textAlign: 'center',
                        paddingTop: 4,
                    }}
                >
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
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginVertical: 2,
                    paddingVertical: 4,
                }}
            >
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
                <View
                    style={{
                        alignSelf: 'center',
                        width: '92%',
                        marginTop: 18,
                    }}
                >
                    <Text
                        style={[
                            styles.sectionHeaderText,
                            { color: colors.labelSecondaryColor },
                        ]}
                    >
                        {t('theme.accent.title')}
                    </Text>

                    <View
                        style={[
                            styles.sectionContainer,
                            {
                                backgroundColor: colors.card,
                                flexDirection: 'column',
                                flexWrap: 'wrap',
                                paddingVertical: 18,
                            },
                        ]}
                    >
                        {colorRows.map((rowColors, index) => (
                            <ColorBoxMatrix colors={rowColors} key={index} />
                        ))}
                    </View>
                    <Text
                        style={{
                            color: colors.labelSecondaryColor,
                            marginTop: 6,
                            fontSize: 12,
                        }}
                    >
                        {t('theme.footer')}
                    </Text>
                </View>
                <View
                    style={{
                        alignSelf: 'center',
                        width: '92%',
                        marginTop: 18,
                    }}
                >
                    <Text
                        style={[
                            styles.sectionHeaderText,
                            { color: colors.labelSecondaryColor },
                        ]}
                    >
                        {'App Icon'}
                    </Text>
                    <Pressable
                        style={[
                            styles.sectionContainer,
                            {
                                backgroundColor: colors.card,
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingStart: 12,
                                paddingEnd: 18,
                                paddingVertical: 12,
                            },
                        ]}
                        onPress={() => {
                            router.push('(user)/appicon')
                        }}
                    >
                        <View style={{ flexDirection: 'row', gap: 20 }}>
                            <Image
                                source={iconImages[appIcon]}
                                style={{
                                    width: 80,
                                    height: 80,
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 16,
                                    borderColor: colors.border,
                                    borderWidth: 1,
                                }}
                            />
                            <Text
                                style={{
                                    color: colors.text,
                                    textAlign: 'center',
                                    fontSize: 18,
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                }}
                            >
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
                                name: 'chevron-right',
                                size: 26,
                            }}
                        />
                    </Pressable>
                </View>
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
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sectionContainer: {
        borderRadius: 8,
        alignContent: 'center',
        justifyContent: 'center',
    },
})
