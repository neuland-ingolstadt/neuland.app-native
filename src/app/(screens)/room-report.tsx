import { RoomReportCategory } from '@/__generated__/gql/graphql'
import neulandApi from '@/api/neuland-api'
import DropdownMenuContent from '@/components/Menu/DropdownMenuContent'
import DropdownMenuItem from '@/components/Menu/DropdownMenuItem'
import DropdownMenuItemTitle from '@/components/Menu/DropdownMenuItemTitle'
import DropdownMenuTrigger from '@/components/Menu/DropdownMenuTrigger'
import { getContrastColor } from '@/utils/ui-utils'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'burnt'
import Color from 'color'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

import PlatformIcon from '../../components/Universal/Icon'

export default function RoomReport(): React.JSX.Element {
    const { styles, theme } = useStyles(stylesheet)

    const [reportCategory, setReportCategory] = useState<
        RoomReportCategory | undefined
    >()
    const roomCategories = Object.values(RoomReportCategory)
    const { room } = useLocalSearchParams<{ room: string }>()

    const [description, setDescription] = useState<string>('')
    const [roomTitle, setRoomTitle] = useState<string>(room)
    const [loading, setLoading] = useState<boolean>(false)

    const { t } = useTranslation('common')

    const mutation = useMutation({
        mutationFn: async (input: {
            room: string
            description: string
            reason: RoomReportCategory
        }) => {
            setLoading(true)
            return await neulandApi.createRoomReport(input)
        },
        onSuccess: () => {
            setLoading(false)
            toast({
                title: t('pages.rooms.report.reportSentSuccess'),
                preset: 'done',
                haptic: 'success',
                duration: 2.5,
                from: 'top',
            })
        },
        onError: (error, variables, context) => {
            setLoading(false)
            toast({
                title: t('pages.rooms.report.reportSentError'),
                preset: 'error',
                haptic: 'error',
                duration: 2.5,
                from: 'top',
            })
            console.error(`Error ${error} ${variables} ${context}`)
        },
    })

    const submitDisabled =
        reportCategory?.trim() == '' || description.trim() == ''

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.modalSectionHeaderContainer}>
                    <Text style={styles.header}>
                        {t('pages.rooms.report.title')}
                    </Text>
                    <Pressable
                        onPress={() => {
                            router.back()
                        }}
                    >
                        <View style={styles.headerIconButton}>
                            <PlatformIcon
                                ios={{
                                    name: 'xmark',
                                    size: 13,
                                    weight: 'bold',
                                }}
                                android={{
                                    name: 'expand_more',
                                    size: 22,
                                }}
                                web={{
                                    name: 'AArrowUp',
                                    size: 22,
                                }}
                                style={styles.xIcon(Platform.OS)}
                            />
                        </View>
                    </Pressable>
                </View>

                <Text style={styles.inputLabel}>
                    {t('pages.rooms.report.room.title')}
                </Text>
                <TextInput
                    style={styles.textInput}
                    value={roomTitle}
                    placeholder={t('pages.rooms.report.room.placeholder')}
                    onChangeText={(text) => setRoomTitle(text)}
                />

                <Text style={styles.inputLabel}>
                    {t('pages.rooms.report.category.title')}
                </Text>
                <DropdownMenu.Root>
                    <DropdownMenuTrigger
                        style={{ ...styles.textInput, ...styles.trigger }}
                    >
                        <Text style={styles.triggerText}>
                            {reportCategory
                                ? t(
                                      `pages.rooms.report.category.type.${reportCategory}`
                                  )
                                : t('pages.rooms.report.category.placeholder')}
                        </Text>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {roomCategories.map((categroy) => {
                            return (
                                <DropdownMenuItem
                                    key={categroy}
                                    onSelect={() => {
                                        setReportCategory(categroy)
                                    }}
                                >
                                    <DropdownMenuItemTitle
                                        style={styles.inputLabel}
                                    >
                                        {t(
                                            `pages.rooms.report.category.type.${categroy}`
                                        )}
                                    </DropdownMenuItemTitle>
                                </DropdownMenuItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu.Root>

                <Text style={styles.inputLabel}>
                    {t('pages.rooms.report.description.title')}
                </Text>
                <TextInput
                    editable
                    multiline
                    numberOfLines={4}
                    maxLength={2000}
                    style={{
                        ...styles.textInput,
                        ...styles.multilineTextInput,
                    }}
                    placeholder={t(
                        'pages.rooms.report.description.placeholder'
                    )}
                    value={description}
                    onChangeText={(text) => setDescription(text)}
                />

                <TouchableOpacity
                    disabled={submitDisabled}
                    onPress={() => {
                        if (!reportCategory || !description) return
                        console.log('reportCategory', reportCategory)
                        console.log('description', description)
                        console.log('room', room)

                        mutation.mutate({
                            reason: reportCategory,
                            description,
                            room: room,
                        })
                    }}
                    style={styles.submitButton(submitDisabled)}
                >
                    {loading ? (
                        <ActivityIndicator
                            color={getContrastColor(theme.colors.primary)}
                            size={15}
                        />
                    ) : (
                        <Text style={styles.buttonText(submitDisabled)}>
                            {t('submit')}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    buttonText: (disabled: boolean) => ({
        fontWeight: 'bold',
        fontSize: 15,
        color: disabled
            ? UnistylesRuntime.themeName === 'dark'
                ? Color(getContrastColor(theme.colors.primary))
                      .lighten(0.1)
                      .hex()
                : Color(getContrastColor(theme.colors.primary))
                      .darken(0.1)
                      .hex()
            : getContrastColor(theme.colors.primary),
    }),
    container: {
        backgroundColor: theme.colors.background,
        padding: theme.margins.card,
    },
    contentContainer: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.mg,
        justifyContent: 'center',
        maxWidth: 400,
        paddingBottom: 30,
        paddingHorizontal: 25,
        paddingTop: 30,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: '100%',
    },
    header: {
        color: theme.colors.text,
        fontSize: 23,
        fontWeight: '600',
        marginBottom: 14,
    },
    headerIconButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: 25,
        height: 34,
        justifyContent: 'center',
        padding: 7,
        width: 34,
    },
    inputLabel: {
        color: theme.colors.text,
        fontSize: 15,
        paddingBottom: 5,
    },
    modalSectionHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
    },
    multilineTextInput: {
        height: 200,
    },
    submitButton: (disabled: boolean) => ({
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 25,
        borderRadius: 7,
        alignItems: 'center',
        backgroundColor: disabled
            ? UnistylesRuntime.themeName === 'dark'
                ? Color(theme.colors.primary).darken(0.3).hex()
                : Color(theme.colors.primary).lighten(0.3).hex()
            : theme.colors.primary,
    }),
    textInput: {
        backgroundColor: theme.colors.inputBackground,
        borderRadius: theme.radius.mg,
        color: theme.colors.text,
        flex: 1,
        fontSize: 17,
        height: 40,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    trigger: {
        backgroundColor: theme.colors.inputBackground,
        flex: 1,
        justifyContent: 'center',
    },
    triggerText: {
        color: theme.colors.text,
        fontSize: 17,
    },
    xIcon: (platform) => ({
        color: Color(theme.colors.text).darken(0.1).hex(),
        marginTop: platform === 'ios' ? 1 : 0,
    }),
}))
