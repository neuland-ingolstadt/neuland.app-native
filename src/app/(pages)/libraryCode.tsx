import ErrorView from '@/components/Elements/Universal/ErrorView'
import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/contexts'
import { useRefreshByUser } from '@/hooks'
import {
    USER_EMPLOYEE,
    USER_GUEST,
    USER_STUDENT,
} from '@/hooks/contexts/userKind'
import { type FormListSections } from '@/types/components'
import {
    getPersonalData,
    guestError,
    networkError,
    permissionError,
} from '@/utils/api-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { getStatusBarStyle } from '@/utils/ui-utils'
import Barcode from '@kichiyaki/react-native-barcode-generator'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import * as Brightness from 'expo-brightness'
import { useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function LibraryCode(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const { userKind } = useContext(UserKindContext)
    const [brightness, setBrightness] = useState<number>(0)
    const brightnessRef = useRef<number>(0)

    const staticColors = {
        white: '#ffffff',
    }

    const { data, isLoading, isError, isPaused, error, isSuccess, refetch } =
        useQuery({
            queryKey: ['personalData'],

            queryFn: getPersonalData,
            staleTime: 1000 * 60 * 60 * 12, // 12 hours
            gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
            enabled: userKind === USER_STUDENT,
        })

    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

    useEffect(() => {
        brightnessRef.current = brightness
    }, [brightness])

    useFocusEffect(
        React.useCallback(() => {
            if (Platform.OS === 'ios') {
                return () => {
                    void Brightness.setSystemBrightnessAsync(
                        brightnessRef.current
                    )
                }
            }
        }, [])
    )

    useEffect(() => {
        if (Platform.OS === 'ios') {
            void (async () => {
                const { status } = await Brightness.requestPermissionsAsync()
                if (status === 'granted') {
                    const value = await Brightness.getSystemBrightnessAsync()
                    setBrightness(value)

                    void Brightness.setSystemBrightnessAsync(1)
                }
            })()
        }
    }, [])

    const sections: FormListSections[] = [
        {
            header: t('profile.formlist.user.library', { ns: 'settings' }),
            items: [
                {
                    title: t('pages.library.code.number'),
                    value: data?.bibnr ?? '',
                },
            ],
        },
    ]

    const toggleBrightness = async (): Promise<void> => {
        if (Platform.OS !== 'ios') {
            return
        }
        if ((await Brightness.getSystemBrightnessAsync()) === 1) {
            void Brightness.setSystemBrightnessAsync(brightness)
        } else {
            void Brightness.setSystemBrightnessAsync(1)
        }
    }
    return (
        <View>
            <StatusBar style={getStatusBarStyle()} />
            {userKind === USER_GUEST ? (
                <ErrorView title={guestError} />
            ) : userKind === USER_EMPLOYEE ? (
                <ErrorView title={permissionError} />
            ) : isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            ) : isError ? (
                <ErrorView
                    title={error?.message ?? t('error.title')}
                    onRefresh={refetchByUser}
                    refreshing={isRefetchingByUser}
                />
            ) : isPaused && !isSuccess ? (
                <ErrorView
                    title={networkError}
                    onRefresh={refetchByUser}
                    refreshing={isRefetchingByUser}
                />
            ) : isSuccess && data?.bibnr !== null ? (
                <View style={styles.container}>
                    <View>
                        <FormList sections={sections} />
                    </View>
                    <Pressable
                        style={{
                            ...styles.barcodeContainer,
                            backgroundColor: staticColors.white,
                        }}
                        onPress={() => {
                            void toggleBrightness()
                        }}
                    >
                        <Barcode
                            format="CODE39"
                            value={data?.bibnr ?? ''}
                            maxWidth={Dimensions.get('window').width - 56}
                            width={5}
                            style={styles.barcodeStyle}
                        />
                    </Pressable>
                    <View style={styles.notesContainer}>
                        <Text
                            style={[
                                styles.notesText,
                                { color: colors.labelColor },
                            ]}
                        >
                            {t('pages.library.code.footer')}
                        </Text>
                    </View>
                </View>
            ) : (
                <ErrorView
                    title={
                        isError
                            ? // @ts-expect-error error is type never
                              error?.message ?? t('error.title')
                            : t('error.title')
                    }
                    onRefresh={refetchByUser}
                    refreshing={isRefetchingByUser}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    loadingContainer: {
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notesContainer: {
        alignSelf: 'center',
        width: '100%',
        marginTop: 14,
        marginBottom: 40,
    },
    notesText: {
        textAlign: 'left',
        fontSize: 12,
    },
    barcodeContainer: {
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 10,
        alignSelf: 'center',
        marginHorizontal: PAGE_PADDING,
        width: '100%',
    },
    barcodeStyle: {
        marginVertical: 6,
        paddingHorizontal: 10,
        alignSelf: 'center',
    },
})
