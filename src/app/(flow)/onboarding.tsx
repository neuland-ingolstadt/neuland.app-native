/* eslint-disable react-hooks/rules-of-hooks */
import WhatsNewBox from '@/components/Elements/Flow/WhatsnewBox'
import LogoSVG from '@/components/Elements/Flow/svgs/logo'
import LogoTextSVG from '@/components/Elements/Flow/svgs/logoText'
import { type Colors } from '@/components/colors'
import { FlowContext, UserKindContext } from '@/components/contexts'
import { PRIVACY_URL, USER_GUEST } from '@/data/constants'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
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

export default function OnboardingScreen(): JSX.Element {
    const flow = React.useContext(FlowContext)
    const userkind = React.useContext(UserKindContext)
    const { t } = useTranslation('flow')

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
        return (
            <View style={styles.buttonContainer}>
                <Pressable
                    style={[
                        {
                            backgroundColor: colors.primary,
                        },
                        styles.button,
                    ]}
                    onPress={() => {
                        if (Platform.OS === 'ios') {
                            void Haptics.selectionAsync()
                        }
                        flow.setOnboarded(true)
                        flow.setUpdated(true)
                        flow.setAnalyticsAllowed(true)

                        if (userkind.userKind === USER_GUEST) {
                            router.navigate('login')
                            router.setParams({ fromOnboarding: 'true' })
                        } else {
                            router.replace('(tabs)/(index)')
                        }
                    }}
                    disabled={buttonDisabled}
                >
                    <Text
                        style={[
                            { color: getContrastColor(colors.primary) },
                            styles.buttonText,
                        ]}
                    >
                        {t('whatsnew.continue')}
                    </Text>
                </Pressable>
            </View>
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
    const [isWhobbleDisabled, setWhobbleDisabled] = useState(true)

    const CardsElement = (): JSX.Element => {
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
        const animatedStyle = useAnimatedStyle(() => ({
            opacity: legalOpacity.value,
            transform: [{ translateY: legalTranslateY.value }],
        }))

        return (
            <Animated.View style={{ ...animatedStyle }}>
                <View
                    style={{
                        ...styles.privacyRow,
                        marginBottom: window.height * 0.04,
                    }}
                >
                    <Text
                        style={{
                            ...styles.privacyText,

                            maxWidth: window.width,
                            color: colors.labelColor,
                        }}
                        numberOfLines={2}
                    >
                        <Text>{t('onboarding.links.agree1')}</Text>
                        <Text
                            disabled={buttonDisabled}
                            style={{
                                color: colors.text,
                                ...styles.linkPrivacy,
                            }}
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

    const colors = useTheme().colors as Colors

    const insets = useSafeAreaInsets()
    const window = Dimensions.get('window')

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
                                            window.height * 0.4,
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

    const logoFadeOutAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: logoOpacity.value,
            height: 150 * logoMargin.value,
            marginTop: logoMargin.value * window.height * 0.5,
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
        const guidelineBaseWidth = 475
        return size * (window.width / guidelineBaseWidth)
    }
    const scaledHeading = scaleFontSize(33)
    const isIos = Platform.OS === 'ios'

    return (
        <>
            <View
                style={{
                    ...styles.page,
                    paddingTop: insets.top + 20,
                    paddingBottom: insets.bottom + 60,
                    backgroundColor: colors.contrast,
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
                                color: colors.text,
                                fontSize: scaledHeading,
                                ...styles.heading1,
                            },
                            textAnimatedStyle,
                        ]}
                    >
                        {t('onboarding.page1.title')}
                    </Animated.Text>
                    <Shimmer
                        opacity={isIos ? 0.65 : 0.9}
                        pauseDuration={300}
                        duration={1400}
                        animating={isIos ? buttonDisabled : false}
                    >
                        <Animated.Text
                            style={[
                                {
                                    color: colors.text,
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
                    <LogoTextSVG size={15} color={colors.text} />
                </Animated.View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    logoTextGroup: { flex: 1, justifyContent: 'center' },
    buttonContainer: {},
    boxesContainer: {
        paddingTop: 20,
        justifyContent: 'center',
    },
    boxes: {
        gap: 12,
        marginHorizontal: 40,
    },

    button: {
        borderRadius: 7,
        paddingVertical: 14,
        paddingHorizontal: 24,
        width: '50%',
        alignSelf: 'center',
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
    },
    page: {
        flex: 1,
        alignItems: 'center',
    },

    linkPrivacy: {
        fontWeight: 'bold',
    },
    privacyRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    privacyText: {
        flexWrap: 'wrap',
        flex: 1,
        textAlign: 'center',
        flexShrink: 1,
    },
    heading1: { fontWeight: 'bold', textAlign: 'center', marginTop: 20 },
    heading2: { fontWeight: 'bold', textAlign: 'center' },
    cardsContainer: {
        flexGrow: 0.5,
    },
    legalContainer: {
        flex: 1,
        width: '95%',
        justifyContent: 'center',
    },
    fullLogoContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        alignItems: 'center',
    },
})
