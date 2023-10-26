import LoginForm from '@/components/Elements/Universal/LoginForm'
import { type Colors } from '@/stores/colors'
import { useTheme } from '@react-navigation/native'
import React, { useRef } from 'react'
import { Image, Linking, Text, View } from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'

export default function OnboardingScreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const onboardingRef = useRef<Onboarding>(null)

    function lighten(percentage: number, color: string): string {
        // Convert the color string to an RGB array
        const rgb = color
            .replace(
                /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
                (_, r, g, b) => r + r + g + g + b + b
            )
            .substring(1)
            .match(/.{2}/g)
            ?.map((x) => parseInt(x, 16)) ?? [0, 0, 0]

        // Lighten the color by the specified percentage
        const newRgb = rgb.map((c) =>
            Math.round(c + (255 - c) * (percentage / 100))
        )

        // Convert the new RGB array back to a color string
        const newColor = `#${newRgb
            .map((c) => c.toString(16).padStart(2, '0'))
            .join('')}`

        return newColor
    }

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
                                    borderRadius: 15,
                                    zIndex: 100,
                                }}
                            />
                        </View>
                    ),

                    title: (
                        <Text
                            style={{
                                fontSize: 30,
                                fontWeight: 'bold',
                                color: 'black',
                                paddingBottom: 40,
                                textAlign: 'center',
                            }}
                        >
                            Welcome to{'\n'}Neuland Next
                        </Text>
                    ),
                    subtitle: (
                        <View
                            style={{
                                alignItems: 'center',
                                paddingHorizontal: 20,
                            }}
                        >
                            <View
                                style={{
                                    gap: 10,

                                    justifyContent: 'space-around',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: '500',
                                        color: 'black',
                                        paddingBottom: 30,
                                        paddingTop: 40,
                                    }}
                                >
                                    Swipe to learn more
                                </Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        gap: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: '#2aa2ba',
                                        }}
                                        onPress={() => {
                                            void Linking.openURL(
                                                'https://assets.neuland.app/datenschutzerklaerung-app.pdf'
                                            )
                                        }}
                                    >
                                        Privacy Policy
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: 'black',
                                        }}
                                    >
                                        -
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: '#2aa2ba',
                                        }}
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
                        </View>
                    ),
                },
                {
                    backgroundColor: '#ffffff',

                    image: (
                        <View style={{}}>
                            <Image
                                source={require('@/assets/onboarding/map.png')}
                                style={{
                                    width: 250,
                                    height: 180,
                                }}
                            />
                        </View>
                    ),

                    title: (
                        <Text
                            style={{
                                fontSize: 30,
                                fontWeight: 'bold',
                                color: 'black',
                                paddingBottom: 40,
                                textAlign: 'center',
                            }}
                        >
                            Everything in one place
                        </Text>
                    ),
                    subtitle: (
                        <View>
                            <View
                                style={{
                                    backgroundColor: '#e5e5e5',
                                    borderRadius: 8,
                                    paddingHorizontal: 14,
                                    marginHorizontal: 16,
                                    paddingVertical: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 17,
                                        color: 'black',

                                        textAlign: 'left',
                                    }}
                                >
                                    Neuland Next combines all important
                                    information about your studies in one app.
                                    {'\n'} {'\n'}
                                    Customize your dashboard to your needs and
                                    get a quick overview of your schedule,
                                    grades, and more.
                                    {'\n'}
                                    The interactive map shows you all important
                                    locations on campus.
                                </Text>
                            </View>
                        </View>
                    ),
                },
                {
                    backgroundColor: '#ffffff',
                    image: (
                        <View style={{}}>
                            <Image
                                source={require('@/assets/onboarding/pocket-knife.png')}
                                style={{
                                    width: 250,
                                    height: 150,
                                }}
                            />
                        </View>
                    ),

                    title: (
                        <Text
                            style={{
                                fontSize: 30,
                                fontWeight: 'bold',
                                color: 'black',
                                paddingBottom: 40,
                                textAlign: 'center',
                            }}
                        >
                            Data Security
                        </Text>
                    ),
                    subtitle: (
                        <View>
                            <View
                                style={{
                                    backgroundColor: '#e5e5e5',
                                    borderRadius: 8,
                                    paddingHorizontal: 14,
                                    marginHorizontal: 16,
                                    paddingVertical: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: 'black',

                                        textAlign: 'left',
                                    }}
                                >
                                    As an alternative to the official THI app,
                                    we strictly protect your data.
                                    {'\n'}
                                    {'\n'}Neuland Next uses the offical and
                                    encrypted API of the THI. Your password and
                                    data is therefore never accessible to us or
                                    third parties.
                                    {'\n'}
                                    {'\n'}No tracking or advertising services
                                    are used. We refrain from collecting any
                                    user data.
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: '#2aa2ba',
                                    textAlign: 'center',
                                    paddingTop: 20,
                                }}
                                onPress={() => {
                                    void Linking.openURL(
                                        'https://assets.neuland.app/datenschutzerklaerung-app.pdf'
                                    )
                                }}
                            >
                                Privacy Policy
                            </Text>
                        </View>
                    ),
                },
                {
                    backgroundColor: lighten(3, colors.primary),
                    image: <View style={{ paddingBottom: 10 }}></View>,
                    title: (
                        <View
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        ></View>
                    ),
                    subtitle: (
                        <View
                            style={{
                                minHeight: 300,
                                marginBottom: 100,
                            }}
                        >
                            <LoginForm></LoginForm>
                        </View>
                    ),
                },
            ]}
        />
    )
}
