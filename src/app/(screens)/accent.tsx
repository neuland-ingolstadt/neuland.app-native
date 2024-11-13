import PlatformIcon from '@/components/Universal/Icon'
import SectionView from '@/components/Universal/SectionsView'
import { accentColors } from '@/components/colors'
import { ThemeContext } from '@/components/contexts'
import { DEFAULT_ACCENT_COLOR } from '@/contexts/theme'
import { getContrastColor } from '@/utils/ui-utils'
import * as Haptics from 'expo-haptics'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, ScrollView, Text, View } from 'react-native'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

export default function Theme(): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { accentColor = DEFAULT_ACCENT_COLOR, setAccentColor } =
        useContext(ThemeContext)
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
        const { styles } = useStyles(stylesheet)
        const themeAccentColor =
            UnistylesRuntime.themeName === 'dark' ? color.dark : color.light
        return (
            <View style={styles.colorBoxContainer}>
                <Pressable
                    onPress={() => {
                        setAccentColor(code)
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
                    accessibilityLabel={t(
                        // @ts-expect-error cannot verify that code is a valid key
                        `theme.colors.${code}`
                    )}
                >
                    <View
                        style={[
                            styles.colorBox,
                            {
                                backgroundColor: themeAccentColor,
                            },
                        ]}
                    >
                        {accentColor === code && (
                            <PlatformIcon
                                ios={{
                                    name: 'checkmark',
                                    size: 20,
                                }}
                                android={{
                                    name: 'check',
                                    size: 24,
                                }}
                                style={{
                                    color: getContrastColor(themeAccentColor),
                                }}
                            />
                        )}
                    </View>
                </Pressable>
                <Text style={styles.colorBoxText}>
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
        const { styles } = useStyles(stylesheet)
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
                    <View style={styles.sectionContainer}>
                        {colorRows.map((rowColors, index) => (
                            <ColorBoxMatrix colors={rowColors} key={index} />
                        ))}
                    </View>
                </SectionView>
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    colorBox: {
        alignContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: theme.radius.mg,
        borderBottomRightRadius: theme.radius.mg,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.sm,
        borderTopLeftRadius: theme.radius.mg,
        borderTopRightRadius: theme.radius.mg,
        borderWidth: 2,
        flexDirection: 'row',
        height: 60,
        justifyContent: 'center',
        width: 60,
    },
    colorBoxContainer: {
        justifyContent: 'center',
    },
    colorBoxText: {
        color: theme.colors.text,
        paddingTop: 4,
        textAlign: 'center',
    },
    colorMatrixContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 2,
        paddingVertical: 4,
    },
    sectionContainer: {
        alignContent: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingVertical: 18,
    },
}))
