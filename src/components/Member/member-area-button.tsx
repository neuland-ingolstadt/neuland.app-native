import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import LogoCardSVG from '@/components/Flow/svgs/logo-card'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'

export function MemberAreaButton(): React.JSX.Element | null {
	const router = useRouter()
	const whiteColor = toColor(useCSSVariable('--color-white'))
	const { t } = useTranslation('settings')

	if (Platform.OS === 'web') {
		return null
	}

	return (
		<View className="gap-1.5 w-full">
			<Text className="ios:text-label-secondary ios:text-base ios:ml-[18px] ios:font-semibold android:text-label-secondary android:text-[13px] android:uppercase">
				{t('about.formlist.neuland')}
			</Text>
			<Pressable
				onPress={() => {
					router.navigate('/member')
				}}
				className="ios:rounded-ios android:rounded-md overflow-hidden w-full active:opacity-90"
			>
				<LinearGradient
					colors={['#000', '#015916']}
					start={{ x: -0.5, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={{ overflow: 'hidden', position: 'relative', width: '100%' }}
				>
					<View className="absolute right-[25px] -top-[5px] pointer-events-none z-0">
						<LogoCardSVG size={70} opacity={0.35} color="#00ff3c" />
					</View>
					<View className="flex-row items-center min-h-[50px] py-[15px] z-[1]">
						<View className="w-7 items-center justify-center ml-4">
							<PlatformIcon
								ios={{
									name: 'person.crop.circle.badge.checkmark',
									size: 18
								}}
								android={{
									name: 'verified_user',
									size: 20
								}}
								web={{
									name: 'UserCheck',
									size: 20
								}}
								style={{ color: whiteColor }}
							/>
						</View>
						<View className="flex-1 pl-4 pr-2">
							<Text className="text-white text-base font-medium leading-5 pr-2">
								{t('about.formlist.memberArea')}
							</Text>
						</View>
						<View className="mr-4 items-center justify-center w-[22px]">
							<PlatformIcon
								ios={{
									name: 'chevron.right',
									size: 10,
									weight: 'semibold'
								}}
								android={{
									name: 'chevron_right',
									size: 19
								}}
								web={{
									name: 'ChevronRight',
									size: 16
								}}
								style={{ color: whiteColor }}
							/>
						</View>
					</View>
				</LinearGradient>
			</Pressable>
		</View>
	)
}
