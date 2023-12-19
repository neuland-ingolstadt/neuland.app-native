import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import {
    type NotificationContentInput,
    type NotificationTriggerInput,
} from 'expo-notifications'
import { t } from 'i18next'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
})

export interface NotificationHook {
    getScheduled: () => Promise<any>
    hasPermission: () => Promise<boolean>
    askForPermission: () => Promise<boolean>
    schedule: (options: {
        content?: NotificationContentInput
        trigger: NotificationTriggerInput
    }) => Promise<any>
    cancelAll: () => Promise<void>
}

const useNotification = (): NotificationHook => {
    const getScheduled = async (): Promise<any> => {
        return await Notifications.getAllScheduledNotificationsAsync()
    }

    const hasPermission = async (): Promise<boolean> => {
        if (Device.isDevice) {
            const { status } = await Notifications.getPermissionsAsync()
            return status === 'granted'
        } else {
            alert('Must use physical device for Push Notifications')
        }

        return false
    }

    const askForPermission = async (): Promise<boolean> => {
        if (Device.isDevice) {
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync()
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync({
                    ios: {
                        allowAlert: true,
                        allowBadge: true,
                        allowSound: true,
                        allowAnnouncements: true,
                    },
                })
                return status === 'granted'
            }
        }
        return false
    }

    const schedule = async (options: {
        content?: NotificationContentInput
        trigger: NotificationTriggerInput
    }): Promise<any> => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: t('notification_reminder_title'),
                body: t('notification_reminder_body'),
            },
            ...options,
        })
    }

    const cancelAll = async (): Promise<void> => {
        await Notifications.cancelAllScheduledNotificationsAsync()
    }

    return {
        getScheduled,
        hasPermission,
        askForPermission,
        schedule,
        cancelAll,
    }
}

export default useNotification
