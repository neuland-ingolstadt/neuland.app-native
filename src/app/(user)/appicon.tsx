import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { AppIconContext } from '@/components/provider'
import { capitalizeFirstLetter } from '@/utils/app-utils'
import { useTheme } from '@react-navigation/native'
import { setAppIcon } from 'expo-dynamic-app-icon'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
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

export default function AppIconPicker(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { appIcon, toggleAppIcon, unlockedAppIcons } =
        useContext(AppIconContext)
    const { t } = useTranslation(['settings'])

    const categories = {
        exclusive: ['default'],
        default: ['default', 'water', 'light', 'dark', 'green'],
        neon: ['liquidNeon', 'whiteNeon', 'greenNeon', 'rainbowNeon'],
        rainbow: [
            'moonRainbowLight',
            'moonRainbowDark',
            'rainbowLight',
            'rainbowDark',
        ],
    }

    categories.exclusive = categories.exclusive.filter((icon) => {
        if (unlockedAppIcons?.includes(icon)) {
            return true
        } else {
            return false
        }
    })

    return (
        <>
            <ScrollView>
                <View
                    style={{
                        alignSelf: 'center',
                        width: '100%',
                        paddingBottom: 50,
                    }}
                >
                    {Object.entries(categories).map(([key, value]) => {
                        return (
                            <SectionView
                                title={t(`appIcon.categories.${key}`)}
                                key={key + 'section'}
                            >
                                <View
                                    style={[
                                        styles.sectionContainer,
                                        { backgroundColor: colors.card },
                                    ]}
                                >
                                    {key === 'exclusive' &&
                                        categories.exclusive.length === 0 && (
                                            <View
                                                style={
                                                    styles.exclusiveContainer
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        {
                                                            color: colors.text,
                                                            ...styles.exclusiveText,
                                                        },
                                                    ]}
                                                >
                                                    {t('appIcon.exclusive')}
                                                </Text>
                                            </View>
                                        )}
                                    {value.map((icon) => {
                                        return (
                                            <>
                                                <Pressable
                                                    key={icon}
                                                    style={styles.rowContainer}
                                                    onPress={() => {
                                                        setAppIcon(
                                                            // this is needed to match naming convention of the icons
                                                            capitalizeFirstLetter(
                                                                icon
                                                            )
                                                        )
                                                        toggleAppIcon(icon)
                                                    }}
                                                >
                                                    <View
                                                        style={
                                                            styles.rowInnerContainer
                                                        }
                                                    >
                                                        <Image
                                                            source={
                                                                iconImages[icon]
                                                            }
                                                            style={{
                                                                borderColor:
                                                                    colors.border,
                                                                ...styles.imageContainer,
                                                            }}
                                                        />
                                                        <Text
                                                            style={{
                                                                color: colors.text,
                                                                ...styles.iconText,
                                                            }}
                                                        >
                                                            {t(
                                                                `appIcon.names.${icon}`
                                                            )}
                                                        </Text>
                                                    </View>
                                                    {appIcon === icon && (
                                                        <PlatformIcon
                                                            color={
                                                                colors.primary
                                                            }
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
                                                </Pressable>

                                                {value.indexOf(icon) !==
                                                    value.length - 1 && (
                                                    <Divider
                                                        width={
                                                            Dimensions.get(
                                                                'window'
                                                            ).width - 140
                                                        }
                                                    />
                                                )}
                                            </>
                                        )
                                    })}
                                </View>
                            </SectionView>
                        )
                    })}
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
    exclusiveContainer: {
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        minHeight: 90,
    },
    exclusiveText: {
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '500',
    },
    rowContainer: {
        flexDirection: 'row',

        alignItems: 'center',
        justifyContent: 'space-between',
        paddingStart: 12,
        paddingEnd: 20,
        paddingVertical: 12,
    },
    rowInnerContainer: {
        flexDirection: 'row',
        gap: 32,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 18,
        borderWidth: 1,
    },
    iconText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
        alignSelf: 'center',
    },
})
