import OnboardingBox from '@/components/Elements/Flow/OnboardingBox'
import EverythingSVG from '@/components/Elements/Flow/svgs/everything'
import LogoSVG from '@/components/Elements/Flow/svgs/logo'
import SecureSVG from '@/components/Elements/Flow/svgs/secure'
import LoginForm from '@/components/Elements/Universal/LoginForm'
import { type Colors } from '@/stores/colors'
import { useTheme } from '@react-navigation/native'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, Text, View } from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'

export default function OnboardingScreen(): JSX.Element {
    const onboardingRef = useRef<Onboarding>(null)
    const PRIVACY_URL: string = process.env.EXPO_PUBLIC_PRIVACY_URL as string
    const IMPRINT_URL: string = process.env.EXPO_PUBLIC_IMPRINT_URL as string

    const colors = useTheme().colors as Colors
    const { t } = useTranslation('flow')

    return (
        <Onboarding
            ref={onboardingRef}
            onSkip={() =>
                onboardingRef.current
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    ?.goToPage(3, false)
            }
            showDone={false}
            nextLabel={t('onboarding.navigation.next')}
            skipLabel={t('onboarding.navigation.skip')}
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
                                {t('onboarding.page1.title')}
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
                                    {t('onboarding.page1.subtitle')}
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
                                        {t('onboarding.links.privacy')}
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
                                        {t('onboarding.links.imprint')}
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
                                {t('onboarding.page2.title')}
                            </Text>

                            <OnboardingBox title={t('onboarding.page2.text')} />

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
                                {t('onboarding.page3.title')}
                            </Text>

                            <OnboardingBox title={t('onboarding.page3.text')} />

                            <Text
                                style={[
                                    styles.linkText,
                                    { color: colors.primary },
                                ]}
                                onPress={() => {
                                    void Linking.openURL(PRIVACY_URL)
                                }}
                            >
                                {t('onboarding.links.privacy')}
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
        minWidth: 320,
        marginBottom: 60,
    },
})
