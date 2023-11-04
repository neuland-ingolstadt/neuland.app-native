import OnboardingBox from '@/components/Elements/Flow/OnboardingBox'
import EverythingSVG from '@/components/Elements/Flow/svgs/everything'
import LogoSVG from '@/components/Elements/Flow/svgs/logo'
import SecureSVG from '@/components/Elements/Flow/svgs/secure'
import LoginForm from '@/components/Elements/Universal/LoginForm'
import { type Colors } from '@/stores/colors'
import { useTheme } from '@react-navigation/native'
import React, { useRef } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'

export default function OnboardingScreen(): JSX.Element {
    const onboardingRef = useRef<Onboarding>(null)
    const PRIVACY_URL: string = process.env.EXPO_PUBLIC_PRIVACY_URL as string
    const IMPRINT_URL: string = process.env.EXPO_PUBLIC_IMPRINT_URL as string

    const colors = useTheme().colors as Colors

    return (
        <Onboarding
            ref={onboardingRef}
            onSkip={() =>
                onboardingRef.current
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    ?.goToPage(3, false)
            }
            showDone={false}
            pages={[
                {
                    backgroundColor: colors.background,
                    image: (
                        <View style={styles.logo}>
                            <LogoSVG size={150} />
                        </View>
                    ),
                    title: (
                        <View style={styles.page}>
                            <Text
                                style={[
                                    styles.header,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                Welcome to{'\n'}Neuland Next
                            </Text>

                            <View style={styles.secondaryContainer}>
                                <Text
                                    style={[
                                        styles.secondaryText,
                                        {
                                            color: colors.text,
                                        },
                                    ]}
                                >
                                    Swipe to learn more
                                </Text>
                                <View style={styles.linkContainer}>
                                    <Text
                                        style={[
                                            styles.linkText,
                                            {
                                                color: colors.primary,
                                            },
                                        ]}
                                        onPress={() => {
                                            void Linking.openURL(PRIVACY_URL)
                                        }}
                                    >
                                        Privacy Policy
                                    </Text>
                                    <Text
                                        style={[
                                            styles.linkText,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        -
                                    </Text>

                                    <Text
                                        style={[
                                            styles.linkText,
                                            {
                                                color: colors.primary,
                                            },
                                        ]}
                                        onPress={() => {
                                            void Linking.openURL(IMPRINT_URL)
                                        }}
                                    >
                                        Imprint
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ),
                },
                {
                    backgroundColor: colors.background,
                    image: (
                        <View style={styles.logo}>
                            <EverythingSVG
                                size={250}
                                primary={colors.primary}
                            />
                        </View>
                    ),
                    title: (
                        <View style={styles.page}>
                            <Text
                                style={[
                                    styles.header,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                Everything in one place
                            </Text>

                            <OnboardingBox
                                title={
                                    `Neuland Next combines all important information about your studies in one app.\n\n` +
                                    `Customize your dashboard to your needs and get a quick overview of your schedule, grades, and more.\n\n` +
                                    `The interactive map shows you all important locations on campus.`
                                }
                            />

                            <Text
                                style={{
                                    color: colors.background,
                                }}
                            />
                        </View>
                    ),
                },
                {
                    backgroundColor: colors.background,
                    image: (
                        <View style={styles.logo}>
                            <SecureSVG size={250} primary={colors.primary} />
                        </View>
                    ),
                    title: (
                        <View style={styles.page}>
                            <Text
                                style={[
                                    styles.header,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                Data Security
                            </Text>

                            <OnboardingBox
                                title={
                                    `Neuland Next is an open source project and developed by students for students.\n\n` +
                                    `As an alternative to the official THI app, we strictly protect your data. ` +
                                    `The app only uses the official and encrypted API provided by the THI.\n\n` +
                                    `Your password and data is therefore never accessible to us or third parties.`
                                }
                            />

                            <Text
                                style={[
                                    styles.linkText,
                                    { color: colors.primary },
                                ]}
                                onPress={() => {
                                    void Linking.openURL(PRIVACY_URL)
                                }}
                            >
                                Privacy Policy
                            </Text>
                        </View>
                    ),
                },
                {
                    backgroundColor: colors.primary,
                    image: <></>,
                    title: (
                        <View style={styles.loginContainer}>
                            <LoginForm />
                        </View>
                    ),
                },
            ]}
        />
    )
}

const styles = StyleSheet.create({
    page: {
        alignItems: 'center',
        gap: 25,
        paddingHorizontal: 16,
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    secondaryContainer: {
        gap: 10,
        alignItems: 'center',
    },
    secondaryText: {
        fontSize: 18,
        fontWeight: '500',
    },
    linkContainer: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
    },
    thirdPrivacyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingTop: 20,
    },
    logo: {
        height: 200,
        flexGrow: 1,
    },
    image: {
        height: 200,
        flexGrow: 1,
    },
    loginContainer: {
        minHeight: 320,
        marginBottom: 60,
    },
})
