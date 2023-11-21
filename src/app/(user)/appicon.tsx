import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { AppIconContext } from '@/components/provider'
import { capitalizeFirstLetter } from '@/utils/app-utils'
import { useTheme } from '@react-navigation/native'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Image,
    type ImageProps,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { changeIcon } from 'rn-dynamic-app-icon'

const iconImages: Record<string, ImageProps> = {
    default: require('@/assets/appIcons/default.png'),
    dark: require('@/assets/appIcons/dark.png'),
    light: require('@/assets/appIcons/light.png'),
    green: require('@/assets/appIcons/green.png'),
    greenNeon: require('@/assets/appIcons/greenNeon.png'),
    lightNeon: require('@/assets/appIcons/lightNeon.png'),
    rainbowNeon: require('@/assets/appIcons/rainbowNeon.png'),
    rainbowLight: require('@/assets/appIcons/rainbowLight.png'),
    rainbowDark: require('@/assets/appIcons/rainbowDark.png'),
    moonRainbowLight: require('@/assets/appIcons/moonRainbowLight.png'),
    moonRainbowDark: require('@/assets/appIcons/moonRainbowDark.png'),
    water: require('@/assets/appIcons/water.png'),
}

export default function AppIconPicker(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { appIcon, toggleAppIcon } = useContext(AppIconContext)

    const categories = {
        exclusive: ['default'],
        default: ['default', 'water', 'light', 'dark', 'green'],
        neon: ['lightNeon', 'greenNeon', 'rainbowNeon'],
        rainbow: [
            'moonRainbowLight',
            'moonRainbowDark',
            'rainbowLight',
            'rainbowDark',
        ],
    }

    const unlockedItems = ['ctf'] as string[]
    const { t } = useTranslation(['settings'])
    // filter the exclusive category and show only the unlocked items
    categories.exclusive = categories.exclusive.filter((icon) => {
        if (unlockedItems.includes(icon)) {
            return true
        } else {
            return false
        }
    })

    // make the fist letter uppercase to match the category name

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
                                key={key}
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
                                                style={[
                                                    {
                                                        justifyContent:
                                                            'center',
                                                        paddingVertical: 20,
                                                        paddingHorizontal: 20,
                                                        minHeight: 85,
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        {
                                                            color: colors.text,
                                                            textAlign: 'center',
                                                            fontSize: 17,
                                                            fontWeight: '500',
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
                                                    style={[
                                                        {
                                                            flexDirection:
                                                                'row',
                                                            flexWrap: 'wrap',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'space-between',
                                                            paddingStart: 12,
                                                            paddingEnd: 20,
                                                            paddingVertical: 12,
                                                        },
                                                    ]}
                                                    onPress={() => {
                                                        changeIcon(
                                                            // this is needed to match naming convention of the icons
                                                            capitalizeFirstLetter(
                                                                icon
                                                            )
                                                        )
                                                            .then(() => {
                                                                toggleAppIcon(
                                                                    icon
                                                                )
                                                            })
                                                            .catch((err) => {
                                                                console.log(err)
                                                            })

                                                        toggleAppIcon(icon)
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            gap: 32,
                                                        }}
                                                    >
                                                        <Image
                                                            source={
                                                                iconImages[icon]
                                                            }
                                                            style={{
                                                                width: 80,
                                                                height: 80,
                                                                alignSelf:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                                borderRadius: 16,
                                                                borderColor:
                                                                    colors.border,
                                                                borderWidth: 1,
                                                            }}
                                                        />
                                                        <Text
                                                            style={{
                                                                color: colors.text,
                                                                textAlign:
                                                                    'center',
                                                                fontSize: 18,
                                                                fontWeight:
                                                                    '500',
                                                                alignSelf:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
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

                                                {
                                                    // show divider if not last item
                                                    value.indexOf(icon) !==
                                                        value.length - 1 && (
                                                        <Divider />
                                                    )
                                                }
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
})
