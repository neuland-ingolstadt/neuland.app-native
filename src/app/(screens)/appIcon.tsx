import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { PreferencesContext } from '@/components/contexts'
import { capitalizeFirstLetter } from '@/utils/app-utils'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Image,
    type ImageProps,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
// @ts-expect-error cannot verify the type of this prop
import AppIcon from 'react-native-dynamic-app-icon'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

let iconImages: Record<string, ImageProps> = {}

iconImages = {
    default: require('@/assets/appIcons/default.png'),
    retro: require('@/assets/appIcons/retro.png'),
    modernGreen: require('@/assets/appIcons/modernGreen.png'),
    modernPink: require('@/assets/appIcons/modernPurple.png'),
    rainbowNeon: require('@/assets/appIcons/rainbowNeon.png'),
    rainbowMoonLight: require('@/assets/appIcons/rainbowMoonLight.png'),
    cat: require('@/assets/appIcons/cat.png'),
}

export const appIcons = Object.keys(iconImages)

export default function AppIconPicker(): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const {
        appIcon = 'default',
        setAppIcon,
        unlockedAppIcons,
    } = useContext(PreferencesContext)
    const { t } = useTranslation(['settings'])
    const categories: Record<string, string[]> = {
        exclusive: ['cat', 'retro'],
        default: ['default', 'modernGreen', 'modernPink'],
        rainbow: ['rainbowNeon', 'rainbowMoonLight'],
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
                <View style={styles.container}>
                    {Object.entries(categories).map(([key, value]) => {
                        return (
                            <SectionView
                                // @ts-expect-error cannot verify the type of this prop
                                title={t(`appIcon.categories.${key}`)}
                                key={key}
                            >
                                <View style={styles.sectionContainer}>
                                    {value.map((icon) => {
                                        return (
                                            <React.Fragment key={icon}>
                                                <Pressable
                                                    style={styles.rowContainer}
                                                    onPress={() => {
                                                        try {
                                                            AppIcon.setAppIcon(
                                                                capitalizeFirstLetter(
                                                                    icon
                                                                )
                                                            )
                                                            setAppIcon(icon)
                                                        } catch (e) {
                                                            console.log(e)
                                                        }
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
                                                            style={
                                                                styles.imageContainer
                                                            }
                                                        />
                                                        <Text
                                                            style={
                                                                styles.iconText
                                                            }
                                                        >
                                                            {t(
                                                                // @ts-expect-error cannot verify the type of this prop
                                                                `appIcon.names.${icon}`
                                                            )}
                                                        </Text>
                                                    </View>
                                                    {appIcon === icon && (
                                                        <PlatformIcon
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
                                                        iosPaddingLeft={110}
                                                    />
                                                )}
                                            </React.Fragment>
                                        )
                                    })}
                                    {key === 'exclusive' &&
                                        categories.exclusive.length === 0 && (
                                            <View
                                                style={
                                                    styles.exclusiveContainer
                                                }
                                            >
                                                <Text
                                                    style={styles.exclusiveText}
                                                >
                                                    {t('appIcon.exclusive')}
                                                </Text>
                                            </View>
                                        )}
                                </View>
                            </SectionView>
                        )
                    })}
                </View>
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        alignSelf: 'center',
        width: '100%',
        paddingBottom: 50,
    },
    sectionContainer: {
        borderRadius: 8,
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.card,
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
        color: theme.colors.text,
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
        borderColor: theme.colors.border,
    },
    iconText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
        alignSelf: 'center',
        color: theme.colors.text,
    },
}))
