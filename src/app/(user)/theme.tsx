import { type Colors, accentColors } from '@/stores/colors'
import { ThemeContext } from '@/stores/provider'
import { getContrastColor } from '@/utils/ui-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function Theme(): JSX.Element {
    const colors = useTheme().colors as Colors
    const deviceTheme = useTheme()
    const { accentColor, toggleAccentColor } = React.useContext(ThemeContext)
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
                            <Ionicons
                                name={'checkmark-sharp'}
                                size={24}
                                color={getContrastColor(themeAccentColor)}
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
                        {t('theme.exclusive.title')}
                    </Text>
                    <View
                        style={[
                            styles.sectionContainer,
                            {
                                backgroundColor: colors.card,
                                flexDirection: 'column',
                                flexWrap: 'wrap',
                                paddingVertical: 36,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: colors.labelSecondaryColor,
                                textAlign: 'center',
                                fontSize: 16,
                                alignSelf: 'center',
                                justifyContent: 'center',
                                letterSpacing: 1.5,
                            }}
                        >
                            {t('theme.exclusive.description')}
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: colors.labelSecondaryColor,
                            marginTop: 14,
                            fontSize: 12,
                        }}
                    >
                        {t('theme.footer')}
                    </Text>
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
