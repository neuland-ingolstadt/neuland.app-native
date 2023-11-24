import PlatformIcon from '@/components/Elements/Universal/Icon'
import SectionView from '@/components/Elements/Universal/SectionsView'
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

let iconImages: Record<string, ImageProps> = {}

if (Platform.OS === 'ios') {
    iconImages = {
        default: require('ios/Default.appiconset/default.png'),
        dark: require('ios/Dark.appiconset/dark.png'),
        light: require('ios/Light.appiconset/light.png'),
        green: require('ios/Green.appiconset/green.png'),
        greenNeon: require('ios/GreenNeon.appiconset/greenNeon.png'),
        whiteNeon: require('ios/WhiteNeon.appiconset/whiteNeon.png'),
        rainbowNeon: require('ios/RainbowNeon.appiconset/rainbowNeon.png'),
        rainbowLight: require('ios/RainbowLight.appiconset/rainbowLight.png'),
        rainbowDark: require('ios/RainbowDark.appiconset/rainbowDark.png'),
        moonRainbowLight: require('ios/MoonRainbowLight.appiconset/moonRainbowLight.png'),
        moonRainbowDark: require('ios/MoonRainbowDark.appiconset/moonRainbowDark.png'),
        water: require('ios/Water.appiconset/water.png'),
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
                </SectionView>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    footerText: {
        marginTop: 6,
        fontSize: 12,
    },
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
})
