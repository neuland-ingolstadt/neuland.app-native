import OnboardingBox from '@/components/Elements/Flow/OnboardingBox'
import EverythingSVG from '@/components/Elements/Flow/svgs/everything'
import LogoSVG from '@/components/Elements/Flow/svgs/logo'
import SecureSVG from '@/components/Elements/Flow/svgs/secure'
import LoginForm from '@/components/Elements/Universal/LoginForm'
import { type Colors } from '@/components/colors'
import { IMPRINT_URL, PRIVACY_URL } from '@/utils/app-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, StyleSheet, Text, View } from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'

export default function OnboardingScreen(): JSX.Element {
    const onboardingRef = useRef<Onboarding>(null)
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
                        </View>
                    ),
                },
                {
                    backgroundColor: colors.primary,
                    image: <></>,
                    title: (
                        <View style={styles.loginContainer}>
                            <LoginForm />

                            <View style={styles.privacyRow}>
                                <Text
                                    style={{
                                        ...styles.privacyText,
                                        color: getContrastColor(colors.primary),
                                    }}
                                    numberOfLines={2}
                                >
                                    <Text style={styles.linkText3}>
                                        {t('onboarding.links.agree1')}
                                    </Text>
                                    <Text
                                        style={styles.linkPrivacy}
                                        onPress={() => {
                                            void Linking.openURL(PRIVACY_URL)
                                        }}
                                    >
                                        {t('onboarding.links.privacypolicy')}
                                    </Text>
                                    <Text style={styles.linkText3}>
                                        {t('onboarding.links.agree2')}
                                    </Text>
                                </Text>
                            </View>
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
    linkText3: {
        fontSize: 15,
    },
    linkPrivacy: {
        fontSize: 15,
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
    },
    logo: {
        height: 200,
        flexGrow: 1,
    },
    loginContainer: {
        minHeight: 400,
        minWidth: 350,
        marginBottom: 60,
        gap: 80,
    },
})
