import ErrorView from '@/components/Error/ErrorView'
import Divider from '@/components/Universal/Divider'
import PlatformIcon from '@/components/Universal/Icon'
import SectionView from '@/components/Universal/SectionsView'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { capitalizeFirstLetter, lowercaseFirstLetter } from '@/utils/app-utils'
import {
    getAppIconName,
    setAlternateAppIcon,
    supportsAlternateIcons,
} from 'expo-alternate-app-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Image,
    type ImageProps,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native'
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
    const unlockedAppIcons = usePreferencesStore(
        (state) => state.unlockedAppIcons
    )
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

    const support = supportsAlternateIcons
    console.log(`The device supports alternate icons: ${support}`)
    const iconName = getAppIconName()
    console.log(`The active app icon is: ${iconName}`)

    if (!support) {
        return (
            <ErrorView
                message={t('appIcon.error.message')}
                title={t('appIcon.error.title')}
                isCritical={false}
            />
        )
    }
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
                                        console.log(icon)
                                        return (
                                            <React.Fragment key={icon}>
                                                <Pressable
                                                    style={styles.rowContainer}
                                                    onPress={() => {
                                                        try {
                                                            void setAlternateAppIcon(
                                                                capitalizeFirstLetter(
                                                                    icon
                                                                )
                                                            )
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
                                                    {lowercaseFirstLetter(
                                                        iconName ?? 'Default'
                                                    ) === icon && (
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
        paddingBottom: 50,
        width: '100%',
    },
    exclusiveContainer: {
        justifyContent: 'center',
        minHeight: 90,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    exclusiveText: {
        color: theme.colors.text,
        fontSize: 17,
        fontWeight: '500',
        textAlign: 'center',
    },
    iconText: {
        alignSelf: 'center',
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
    },
    imageContainer: {
        borderColor: theme.colors.border,
        borderRadius: 18,
        borderWidth: 1,
        height: 80,
        width: 80,
    },
    rowContainer: {
        alignItems: 'center',

        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingEnd: 20,
        paddingStart: 12,
        paddingVertical: 12,
    },
    rowInnerContainer: {
        flexDirection: 'row',
        gap: 32,
    },
    sectionContainer: {
        alignContent: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        justifyContent: 'center',
    },
}))
