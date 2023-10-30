import OnboardingBox from '@/components/Elements/Flow/OnboardingBox'
import LoginForm from '@/components/Elements/Universal/LoginForm'
import { lighten } from '@/utils/ui-utils'
import React, { useRef } from 'react'
import { Image, Linking, StyleSheet, Text, View } from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'

export default function OnboardingScreen(): JSX.Element {
    const onboardingRef = useRef<Onboarding>(null)
    const PRIVACY_URL =
        'https://assets.neuland.app/datenschutzerklaerung-app.pdf'
    return (
        <Onboarding
            ref={onboardingRef}
            onSkip={() => onboardingRef.current.goToPage(3, false)}
            showDone={false}
            pages={[
                {
                    backgroundColor: '#ffffff',
                    image: (
                        <View>
                            <Image
                                source={require('@/assets/icon.png')}
                                style={{
                                    width: 250,
                                    height: 250,
                                }}
                            />
                        </View>
                    ),

                    title: (
                        <Text style={styles.header}>
                            Welcome to{'\n'}Neuland Next
                        </Text>
                    ),
                    subtitle: (
                        <View style={styles.firstSubtitleContainer}>
                            <Text style={styles.firstSubtitleText}>
                                Swipe to learn more
                            </Text>
                            <View style={styles.firstSubtitleLinks}>
                                <Text
                                    style={styles.firstSubtitleLinkText}
                                    onPress={() => {
                                        void Linking.openURL(PRIVACY_URL)
                                    }}
                                >
                                    Privacy Policy
                                </Text>
                                <Text style={styles.firstSubtitleLinkConnector}>
                                    -
                                </Text>

                                <Text
                                    style={styles.firstSubtitleLinkText}
                                    onPress={() => {
                                        void Linking.openURL(
                                            'https://assets.neuland.app/impressum-app.htm'
                                        )
                                    }}
                                >
                                    Imprint
                                </Text>
                            </View>
                        </View>
                    ),
                },
                {
                    backgroundColor: '#ffffff',
                    image: (
                        <Image
                            source={require('@/assets/onboarding/map.png')}
                            style={{
                                width: 250,
                                height: 180,
                            }}
                        />
                    ),

                    title: (
                        <Text style={styles.header}>
                            Everything in one place
                        </Text>
                    ),
                    subtitle: (
                        <OnboardingBox
                            title={
                                `Neuland Next combines all important information about your studies in one app.\n\n` +
                                `Customize your dashboard to your needs and get a quick overview of your schedule, grades, and more.\n\n` +
                                `The interactive map shows you all important locations on campus.`
                            }
                        />
                    ),
                },
                {
                    backgroundColor: '#ffffff',
                    image: (
                        <Image
                            source={require('@/assets/onboarding/pocket-knife.png')}
                            style={{
                                width: 250,
                                height: 150,
                            }}
                        />
                    ),

                    title: <Text style={styles.header}>Data Security</Text>,
                    subtitle: (
                        <View>
                            <OnboardingBox
                                title={
                                    `Neuland Next is an open source project and developed by students for students.\n\n` +
                                    `As an alternative to the official THI app, we strictly protect your data. ` +
                                    `The app only uses the official and encrypted API provided by the THI.\n\n` +
                                    `Your password and data is therefore never accessible to us or third parties.`
                                }
                            />
                            <Text
                                style={styles.thirdPrivacyText}
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
                    backgroundColor: lighten(0.1, '#31aac3'),
                    image: <></>,
                    title: <></>,
                    subtitle: (
                        <View style={styles.loginContainer}>
                            <LoginForm></LoginForm>
                        </View>
                    ),
                },
            ]}
        />
    )
}

const styles = StyleSheet.create({
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000000',
        paddingBottom: 35,
        textAlign: 'center',
    },
    firstSubtitleContainer: {
        gap: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    firstSubtitleText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000000',
        paddingBottom: 30,
        paddingTop: 40,
    },
    firstSubtitleLinks: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    firstSubtitleLinkText: {
        fontSize: 14,
        color: '#2aa2ba',
    },
    firstSubtitleLinkConnector: {
        fontSize: 14,
        color: '#000000',
    },
    thirdPrivacyText: {
        fontSize: 14,
        color: '#2aa2ba',
        textAlign: 'center',
        paddingTop: 20,
    },
    loginContainer: {
        minHeight: 300,
        marginBottom: 50,
    },
})
