import { trackEvent } from '@aptabase/react-native'
import { type ErrorBoundaryProps, usePathname } from 'expo-router'
import type React from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { useSessionStore } from '@/hooks/useSessionStore'
import { toColor } from '@/utils/uniwind-utils'

import LogoTextSVG from '../Flow/svgs/logo-text'
import PlatformIcon from '../Universal/icon'
import StatusBox from './action-box'

export const ErrorButton = ({
	onPress
}: {
	onPress: () => void
}): React.JSX.Element => {
	const { t } = useTranslation('common')
	return (
		<Pressable
			className="self-center items-center rounded-mg bg-card"
			onPress={onPress}
		>
			<View className="flex-row items-center px-[30px] py-2.5">
				<Text className="text-base font-semibold text-primary">
					{t('error.crash.reload')}
				</Text>
			</View>
		</Pressable>
	)
}

export default function CrashView({
	error,
	retry
}: ErrorBoundaryProps): React.JSX.Element {
	const { t } = useTranslation('common')
	const labelSecondaryColor = useCSSVariable('--color-label-secondary')
	const path = usePathname()
	const analyticsInitialized = useSessionStore(
		(state) => state.analyticsInitialized
	)

	useEffect(() => {
		if (!analyticsInitialized) return
		trackEvent('ErrorView', {
			title: error.message,
			path,
			crash: true
		})
	}, [analyticsInitialized, error.message, path])

	const handlePress = (): void => {
		retry().catch((error) => {
			console.info('Error while retrying', error)
		})
	}

	return (
		<View className="flex-1 bg-background">
			<View className="w-[85%] flex-1 items-center justify-evenly self-center py-5">
				<View className="items-center gap-5">
					<PlatformIcon
						ios={{
							name: 'pc',
							size: 80,
							renderMode: 'multicolor'
						}}
						android={{
							name: 'error',
							size: 80
						}}
						web={{
							name: 'ServerCrash',
							size: 80
						}}
					/>
					<Text className="my-2 text-center text-[22px] font-bold text-text">
						{t('error.crash.title')}
					</Text>
					<Text className="text-center text-lg text-text">
						{t('error.crash.description')}
					</Text>
				</View>

				<StatusBox error={error} crash={true} />
				<ErrorButton onPress={handlePress} />
			</View>
			<View className="absolute bottom-[30px] self-center">
				<LogoTextSVG size={15} color={toColor(labelSecondaryColor) as string} />
			</View>
		</View>
	)
}
