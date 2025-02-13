import { RoomReportCategory } from '@/__generated__/gql/graphql'
import neulandApi from '@/api/neuland-api'
import DropdownMenuContent from '@/components/Menu/DropdownMenuContent'
import DropdownMenuItem from '@/components/Menu/DropdownMenuItem'
import DropdownMenuItemTitle from '@/components/Menu/DropdownMenuItemTitle'
import DropdownMenuTrigger from '@/components/Menu/DropdownMenuTrigger'
import { useMutation } from '@tanstack/react-query'
import Color from 'color'
import { router, useLocalSearchParams } from 'expo-router'
import { Check } from 'lucide-react-native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'
import * as DropdownMenu from 'zeego/dropdown-menu'

import PlatformIcon from '../../components/Universal/Icon'

export default function RoomReport(): React.JSX.Element {
    const { styles } = useStyles(stylesheet)

    const mutation = useMutation({
        mutationFn: async (input: {
            room: string
            description: string
            reason: RoomReportCategory
        }) => {
            return await neulandApi.createRoomReport(input)
        },
        onError: (error, variables, context) => {
            // An error happened!
            console.log(`Error!!! ${error} ${variables} ${context}`)
        },
        onSuccess: (data, variables, context) => {
            console.log(`Success____ ${data} ${variables} ${context}`)
        },
        onSettled: (data, error, variables, context) => {
            console.log(`Settledüüüü ${data} ${error} ${variables} ${context}`)
        },
    })
    const [reportCategory, setReportCategory] = useState<
        RoomReportCategory | undefined
    >()
    const [description, setDescription] = useState<string>('')
    const { room } = useLocalSearchParams<{ room: string }>()
    console.log(room)

    const [roomTitle, setRoomTitle] = useState<string>(room)
    const roomCategories = Object.values(RoomReportCategory)

    const { t } = useTranslation('common')

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.modalSectionHeaderContainer}>
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

            <Text style={styles.title}>
                {t('pages.rooms.report.room.title')}
            </Text>
            <TextInput
                style={styles.textInput}
                value={roomTitle}
                placeholder={t('pages.rooms.report.room.placeholder')}
                onChangeText={(text) => setRoomTitle(text)}
            />

            <Text style={styles.title}>
                {t('pages.rooms.report.category.title')}
            </Text>
            <DropdownMenu.Root>
                <DropdownMenuTrigger>
                    <Text>
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
                                <DropdownMenuItemTitle>
                                    {t(
                                        `pages.rooms.report.category.type.${categroy}`
                                    )}
                                </DropdownMenuItemTitle>
                                <DropdownMenu.ItemIcon androidIconName="check">
                                    <Check size={18} />
                                </DropdownMenu.ItemIcon>
                            </DropdownMenuItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu.Root>

            <Text style={styles.title}>
                {t('pages.rooms.report.description.title')}
            </Text>
            <TextInput
                editable
                multiline
                numberOfLines={4}
                maxLength={2000}
                style={[styles.textInput, styles.multilineTextInput]}
                placeholder={t('pages.rooms.report.description.placeholder')}
                value={description}
                onChangeText={(text) => setDescription(text)}
            />

            <Pressable
                onPress={() => {
                    if (!reportCategory || !description) return

                    mutation.mutate({
                        reason: reportCategory,
                        description,
                        room: room,
                    })
                }}
                style={styles.submit}
            >
                <Text>{t('submit')}</Text>
            </Pressable>

            {mutation.isError ? (
                <View>
                    <Text>{mutation.error.message}</Text>
                </View>
            ) : null}
        </ScrollView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        padding: 20,
    },
    // contentContainer: { padding: 20 },
    // errorContainer: {
    //     backgroundColor: theme.colors.background,
    //     flex: 1,
    //     height: '100%',
    //     justifyContent: 'center',
    //     position: 'absolute',
    //     width: '100%',
    //     zIndex: 100,
    // },
    headerIconButton: {
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: 25,
        height: 34,
        justifyContent: 'center',
        padding: 7,
        width: 34,
    },
    modalSectionHeaderContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        paddingBottom: 0,
    },
    submit: {
        borderColor: 'red',
        borderWidth: 3,
    },
    textInput: {
        backgroundColor:
            UnistylesRuntime.themeName === 'dark'
                ? Color(theme.colors.card)
                      .lighten(Platform.OS === 'ios' ? 0.3 : 0.1)
                      .hex()
                : Color(theme.colors.card)
                      .darken(Platform.OS === 'ios' ? 0.03 : 0.01)
                      .hex(),
        borderRadius: theme.radius.mg,
        color: theme.colors.text,
        flex: 1,
        fontSize: 17,
        height: 40,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    multilineTextInput: {
        height: 200,
    },
    title: {
        fontSize: 18,
    },
    xIcon: (platform) => ({
        color: Color(theme.colors.text).darken(0.1).hex(),
        marginTop: platform === 'ios' ? 1 : 0,
    }),
}))
