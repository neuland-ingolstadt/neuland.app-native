import * as Application from 'expo-application'
import { usePathname } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, Text, View } from 'react-native'
import { STATUS_URL } from '@/data/constants'

export const FeedbackButton = ({
	error,
	crash
}: {
	error: Error
	crash: boolean
}): React.JSX.Element => {
	const { t } = useTranslation('common')
	const platform = Platform.OS
	const appVersion = `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`
	const subject = crash
		? t('feedbackMail.subjectCrash')
		: t('feedbackMail.subjectError')
	const pathname = usePathname()
	const mailContent = `mailto:feedback@neuland.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
		t('feedbackMail.body', {
			version: appVersion,
			platform,
			path: pathname,
			error: error.message
		})
	)}`

	const sendMail = (): void => {
		Linking.openURL(mailContent).catch((err) => {
			console.error('Error opening mail client:', err)
		})
	}
	return (
		<Pressable
			className="self-center items-center rounded-mg bg-background"
			onPress={() => {
				sendMail()
			}}
		>
			<View className="flex-row items-center px-[30px] py-2.5">
				<Text className="text-[15px] font-semibold text-text">
					{t('error.crash.feedback')}
				</Text>
			</View>
		</Pressable>
	)
}

export const StatusButton = (): React.JSX.Element => {
	const { t } = useTranslation('common')

	return (
		<Pressable
			className="self-center items-center rounded-mg bg-background"
			onPress={() => {
				void Linking.openURL(STATUS_URL)
			}}
		>
			<View className="flex-row items-center px-[30px] py-2.5">
				<Text className="text-[15px] font-semibold text-text">
					{t('error.crash.status')}
				</Text>
			</View>
		</Pressable>
	)
}
