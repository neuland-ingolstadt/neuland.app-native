import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function AppIcon(): JSX.Element {
    const colors = useTheme().colors as Colors

    return (
        <>
            <ScrollView>
                <View
                    style={{
                        alignSelf: 'center',
                        width: '92%',
                        marginTop: 18,
                    }}
                >
                    <Text
                        style={[
                            styles.sectionHeaderText,
                            { color: colors.labelSecondaryColor },
                        ]}
                    >
                        {' App Icon'}
                    </Text>
                    <Pressable
                        style={[
                            styles.sectionContainer,
                            {
                                backgroundColor: colors.card,
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingStart: 12,
                                paddingEnd: 20,
                                paddingVertical: 12,
                            },
                        ]}
                        onPress={() => {
                            console.log('pressed')
                        }}
                    >
                        <View style={{ flexDirection: 'row', gap: 32 }}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={{
                                    width: 90,
                                    height: 90,
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 10,

                                    shadowColor: colors.border,
                                    shadowOpacity: 0.1,
                                    shadowRadius: 1,
                                    shadowOffset: {
                                        width: 0,
                                        height: 1,
                                    },
                                }}
                            />
                            <Text
                                style={{
                                    color: colors.text,
                                    textAlign: 'center',
                                    fontSize: 18,
                                    fontWeight: '500',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {'Default icon'}
                            </Text>
                        </View>
                        <PlatformIcon
                            color={colors.primary}
                            ios={{
                                name: 'checkmark',
                                size: 20,
                            }}
                            android={{
                                name: 'check',
                                size: 24,
                            }}
                        />
                    </Pressable>
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
})
