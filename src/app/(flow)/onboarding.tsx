/* eslint-disable react-hooks/rules-of-hooks */
import WhatsNewBox from '@/components/Flow/WhatsnewBox'
import LogoSVG from '@/components/Flow/svgs/logo'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import PlatformIcon from '@/components/Universal/Icon'
import { FlowContext } from '@/components/contexts'
import { PRIVACY_URL } from '@/data/constants'
import { getContrastColor } from '@/utils/ui-utils'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    Linking,
    Platform,
    Pressable,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Shimmer from 'react-native-shimmer'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function OnboardingScreen(): JSX.Element {
    const flow = React.useContext(FlowContext)
    const { t, i18n } = useTranslation('flow')

    const data = [
        {
            title: t('onboarding.cards.title1'),
            description: t('onboarding.cards.description1'),
            icon: {
                ios: 'square.stack.3d.up',
                android: 'hub',
            },
        },

        {
            title: t('onboarding.cards.title2'),
            description: t('onboarding.cards.description2'),
            icon: {
                ios: 'person.2.gobackward',
                android: 'volunteer_activism',
            },
        },
        {
            title: t('onboarding.cards.title3'),
            description: t('onboarding.cards.description3'),
            icon: {
                ios: 'lock.app.dashed',
                android: 'encrypted',
            },
        },
    ]

    const ContinueButton = (): JSX.Element => {
        const { styles } = useStyles(stylesheet)
        return (
            <Pressable
                style={styles.button}
                onPress={() => {
                    console.log('ContinueButton')
                    if (Platform.OS === 'ios') {
                        void Haptics.selectionAsync()
                    }
                    flow.setOnboarded(true)
                    flow.setUpdated(true)
                    flow.setAnalyticsAllowed(true)
                    router.navigate({
                        pathname: '/login',
                        params: { fromOnboarding: 'true' },
                    })
                }}
                disabled={buttonDisabled}
            >
                <Text style={styles.buttonText}>{t('whatsnew.continue')}</Text>
            </Pressable>
        )
    }

    const cardsOpacity = data.map(() => useSharedValue(0))
    const cardsTranslateY = data.map(() => useSharedValue(20))
    const legalOpacity = useSharedValue(0)
    const legalTranslateY = useSharedValue(20)
    const logoOpacity = useSharedValue(0)
    const textTranslateY = useSharedValue(20)
    const textOpacity = useSharedValue(0)
    const cardsViewHeight = useSharedValue(0)
    const textLogoOpacity = useSharedValue(1)
    const logoMargin = useSharedValue(1)
    const helpOpacity = useSharedValue(0)
    const [isWhobbleDisabled, setWhobbleDisabled] = useState(true)
    const window = Dimensions.get('window')

    const CardsElement = (): JSX.Element => {
        const { styles } = useStyles(stylesheet)
        return (
            <Animated.View style={[styles.boxesContainer, styles.boxes]}>
                {data.map(({ title, description, icon }, index) => {
                    const rotation = useSharedValue(0)

                    const animatedStyles = useAnimatedStyle(() => {
                        return {
                            transform: [{ rotateZ: `${rotation.value}deg` }],
                        }
                    })

                    const handlePress = (): void => {
                        if (Platform.OS === 'ios') {
                            void Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light
                            )
                        }
                        const direction = Math.random() > 0.5 ? 1 : -1
                        rotation.value = withSequence(
                            withTiming(direction * -1.5, {
                                duration: 100,
                                easing: Easing.linear,
                            }),
                            withTiming(direction * 1, {
                                duration: 100,
                                easing: Easing.linear,
                            }),
                            withTiming(direction * -0.5, {
                                duration: 100,
                                easing: Easing.linear,
                            }),
                            withTiming(0, {
                                duration: 100,
                                easing: Easing.linear,
                            })
                        )
                    }

                    const animatedStyle = useAnimatedStyle(() => ({
                        opacity: cardsOpacity[index].value,
                        transform: [
                            { translateY: cardsTranslateY[index].value },
                        ],
                    }))

                    return (
                        <Pressable
                            onPress={() => {
                                if (!isWhobbleDisabled) {
                                    handlePress()
                                }
                            }}
                            key={index}
                        >
                            <Animated.View style={animatedStyles}>
                                <Animated.View style={animatedStyle}>
                                    <WhatsNewBox
                                        title={title}
                                        description={description}
                                        icon={icon}
                                    />
                                </Animated.View>
                            </Animated.View>
                        </Pressable>
                    )
                })}
            </Animated.View>
        )
    }

    const LegalArea = (): JSX.Element => {
        const legalAnimatedStyle = useAnimatedStyle(() => ({
            opacity: legalOpacity.value,
            transform: [{ translateY: legalTranslateY.value }],
        }))
        const { styles } = useStyles(stylesheet)
        return (
            <Animated.View style={{ ...legalAnimatedStyle }}>
                <View
                    style={{
                        ...styles.privacyRow,
                        marginBottom: window.height * 0.035,
                        marginTop: window.height * 0.008,
                    }}
                >
                    <Text
                        style={{
                            ...styles.privacyText,

                            maxWidth: window.width,
                        }}
                        numberOfLines={2}
                    >
                        <Text>{t('onboarding.links.agree1')}</Text>
                        <Text
                            disabled={buttonDisabled}
                            style={styles.linkPrivacy}
                            onPress={() => {
                                void Linking.openURL(PRIVACY_URL)
                            }}
                        >
                            {t('onboarding.links.privacy')}
                        </Text>
                        <Text>{t('onboarding.links.agree2')}</Text>
                    </Text>
                </View>
                <ContinueButton />
            </Animated.View>
        )
    }

    const insets = useSafeAreaInsets()

    const textLogoAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: textLogoOpacity.value,
        }
    })

    const logoAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: logoOpacity.value,
        }
    })

    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: textTranslateY.value }],
            opacity: textOpacity.value,
        }
    })

    const helpAnimatedStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            top: insets.top + 15,
            right: 18,
            opacity: helpOpacity.value,
        }
    })

    useEffect(() => {
        logoOpacity.value = withDelay(
            250,
            withTiming(
                1,
                { duration: 1300, easing: Easing.out(Easing.quad) },
                () => {
                    textTranslateY.value = withTiming(0, {
                        duration: 800,
                        easing: Easing.out(Easing.quad),
                    })

                    textOpacity.value = withTiming(
                        1,
                        {
                            duration: 900,
                            easing: Easing.out(Easing.quad),
                        },
                        () => {
                            logoMargin.value = withDelay(
                                1250,
                                withTiming(0, {
                                    duration: 1200,
                                    easing: Easing.out(Easing.quad),
                                })
                            )
                            textLogoOpacity.value = withDelay(
                                1250,
                                withTiming(0, {
                                    duration: 600,
                                    easing: Easing.out(Easing.quad),
                                })
                            )
                            logoOpacity.value = withDelay(
                                800,
                                withTiming(
                                    0,
                                    {
                                        duration: 800,
                                        easing: Easing.out(Easing.quad),
                                    },
                                    () => {
                                        cardsViewHeight.value = withTiming(
                                            reanimatedWindow.height * 0.4,
                                            {
                                                duration: 50,
                                                easing: Easing.out(Easing.quad),
                                            }
                                        )
                                        const initialDelay = 800
                                        data.forEach((_, index) => {
                                            const delay =
                                                initialDelay + index * 100

                                            cardsOpacity[index].value =
                                                withDelay(
                                                    delay,
                                                    withTiming(1, {
                                                        duration: 500,
                                                    })
                                                )

                                            cardsTranslateY[index].value =
                                                withDelay(
                                                    delay,
                                                    withTiming(0, {
                                                        duration: 500,
                                                    })
                                                )
                                        })
                                        runOnJS(setWhobbleDisabled)(false)
                                        helpOpacity.value = withDelay(
                                            1400,
                                            withTiming(1, {
                                                duration: 500,
                                                easing: Easing.out(Easing.quad),
                                            })
                                        )
                                        legalOpacity.value = withDelay(
                                            1400,
                                            withTiming(1, {
                                                duration: 500,
                                                easing: Easing.out(Easing.quad),
                                            })
                                        )

                                        legalTranslateY.value = withDelay(
                                            1400,
                                            withTiming(
                                                0,
                                                {
                                                    duration: 500,
                                                    easing: Easing.out(
                                                        Easing.quad
                                                    ),
                                                },
                                                (isFinished) => {
                                                    if (isFinished === true) {
                                                        runOnJS(
                                                            setButtonDisabled
                                                        )(false)
                                                    }
                                                }
                                            )
                                        )
                                    }
                                )
                            )
                        }
                    )
                }
            )
        )
    }, [])

    const reanimatedWindow = useWindowDimensions()
    const logoFadeOutAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: logoOpacity.value,
            height: 150 * logoMargin.value,
            marginTop: logoMargin.value * reanimatedWindow.height * 0.5,
            marginBottom: logoMargin.value * 40,
        }
    })

    const cardsViewAnimatedStyle = useAnimatedStyle(() => {
        return {
            minHeight: cardsViewHeight.value,
        }
    })

    const [buttonDisabled, setButtonDisabled] = useState(true)
    const scaleFontSize = (size: number): number => {
        if (DeviceInfo.isTablet()) {
            return size
        }
        const guidelineBaseWidth = 475
        return size * (window.width / guidelineBaseWidth)
    }
    const scaledHeading = scaleFontSize(33)
    const isIos = Platform.OS === 'ios'
    const { styles } = useStyles(stylesheet)
    return (
        <>
            <View
                style={{
                    ...styles.page,
                    paddingTop: insets.top + 20,
                    paddingBottom: insets.bottom + 60,
                }}
            >
                <View style={styles.logoTextGroup}>
                    <Animated.View
                        style={{
                            ...logoAnimatedStyle,
                            ...logoFadeOutAnimatedStyle,
                        }}
                    >
                        <LogoSVG size={160} />
                    </Animated.View>

                    <Animated.Text
                        style={[
                            {
                                fontSize: scaledHeading,
                                ...styles.heading1,
                            },
                            textAnimatedStyle,
                        ]}
                    >
                        {t('onboarding.page1.title')}
                    </Animated.Text>
                    <Shimmer
                        opacity={isIos ? 0.65 : 1}
                        pauseDuration={300}
                        duration={1400}
                        animating={isIos ? buttonDisabled : false}
                    >
                        <Animated.Text
                            style={[
                                {
                                    fontSize: scaledHeading,
                                    ...styles.heading2,
                                },
                                textAnimatedStyle,
                            ]}
                        >
                            {'Neuland Next'}
                        </Animated.Text>
                    </Shimmer>
                </View>
                <Animated.View
                    style={[styles.cardsContainer, cardsViewAnimatedStyle]}
                >
                    <CardsElement />
                </Animated.View>

                <View style={styles.legalContainer}>
                    <LegalArea />
                </View>
                <Animated.View
                    style={[styles.fullLogoContainer, textLogoAnimatedStyle]}
                >
                    <LogoTextSVG size={15} color={styles.heading1.color} />
                </Animated.View>
            </View>
            <Animated.View style={helpAnimatedStyle}>
                <Pressable
                    onPress={() => {
                        void Linking.openURL(
                            `https://next.neuland.app/${i18n.language === 'de' ? '' : 'en/'}app/faq`
                        )
                    }}
                    style={{}}
                >
                    <PlatformIcon
                        style={styles.icon}
                        ios={{
                            name: 'questionmark.circle',
                            size: 20,
                            variableValue: 1,
                        }}
                        android={{
                            name: 'help',
                            size: 25,
                            variant: 'outlined',
                        }}
                    />
                </Pressable>
            </Animated.View>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    boxes: {
        gap: 12,
        marginHorizontal: 40,
    },
    boxesContainer: {
        justifyContent: 'center',
        paddingTop: 20,
    },
    button: {
        alignSelf: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        paddingHorizontal: 24,
        paddingVertical: 14,
        width: '50%',
    },

    buttonText: {
        color: getContrastColor(theme.colors.primary),
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    cardsContainer: {
        flexGrow: 0.5,
    },
    fullLogoContainer: {
        alignItems: 'center',
        bottom: 30,
        position: 'absolute',
        width: '100%',
    },

    heading1: {
        color: theme.colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    heading2: {
        color: theme.colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    icon: {
        color: theme.colors.labelSecondaryColor,
    },
    legalContainer: {
        flex: 1,
        justifyContent: 'center',
        width: '95%',
    },
    linkPrivacy: {
        color: theme.colors.text,
        fontWeight: 'bold',
    },
    logoTextGroup: { flex: 1, justifyContent: 'center' },
    page: {
        alignItems: 'center',
        backgroundColor: theme.colors.contrast,
        flex: 1,
    },
    privacyRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    privacyText: {
        color: theme.colors.labelColor,
        flexWrap: 'wrap',
        flex: 1,
        flexShrink: 1,
        textAlign: 'center',
    },
}))
