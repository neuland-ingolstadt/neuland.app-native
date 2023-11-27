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
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

let iconImages: Record<string, ImageProps> = {}

iconImages = {
    default: require('@/assets/appIcons/default.png'),
    modernDark: require('@/assets/appIcons/modernDark.png'),
    modernLight: require('@/assets/appIcons/modernLight.png'),
    modernGreen: require('@/assets/appIcons/modernGreen.png'),
    rainbowDark: require('@/assets/appIcons/rainbowDark.png'),
    rainbowMoonLight: require('@/assets/appIcons/rainbowMoonLight.png'),
}

export default function AppIconPicker(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { appIcon, toggleAppIcon, unlockedAppIcons } =
        useContext(AppIconContext)
    const { t } = useTranslation(['settings'])
    const categories: Record<string, string[]> = {
        default: ['default', 'modernLight', 'modernDark', 'modernGreen'],
        rainbow: ['rainbowMoonLight', 'rainbowDark'],
        exclusive: [],
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
                                                        try {
                                                            setAppIcon(
                                                                capitalizeFirstLetter(
                                                                    icon
                                                                )
                                                            )
                                                            toggleAppIcon(icon)
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
