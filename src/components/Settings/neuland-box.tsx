import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { t } from 'i18next'
import type React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import LogoSVG from '@/components/Flow/svgs/logo'
import LogoCardSVG from '@/components/Flow/svgs/logo-card'
import PlatformIcon from '@/components/Universal/icon'
import { useMemberStore } from '@/hooks/useMemberStore'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import AvatarCircle from './avatar-circle'

const NeulandBox = (): React.JSX.Element | null => {
	const router = useRouter()
	const memberInfo = useMemberStore((s) => s.info)
	const neulandGreen = toColor(useCSSVariable('--color-neuland-green'))
	const whiteColor = toColor(useCSSVariable('--color-white'))

	if (Platform.OS === 'web') {
		return null
	}

	if (!memberInfo) {
		return null
	}

	const hasHonoraryRole =
		memberInfo.groups?.some((group) =>
			group.toLowerCase().includes('ehrenmitglied')
		) ?? false

	return (
		<View className="mt-2.5">
			<Pressable
				onPress={() => router.navigate('/member')}
				className="ios:rounded-ios android:rounded-md web:rounded-md border-border overflow-hidden w-full active:opacity-90"
				style={hairlineBorder}
			>
				<LinearGradient
					colors={['#000', '#015916']}
					start={{ x: -0.5, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={{ overflow: 'hidden', position: 'relative', width: '100%' }}
				>
					<View className="absolute right-[18px] -top-2.5 pointer-events-none z-0">
						<LogoCardSVG size={110} opacity={0.35} color="#00ff3c" />
					</View>
					<View className="flex-row items-center p-4 z-[1]">
						<AvatarCircle
							background="rgba(0, 255, 60, 0.12)"
							size={50}
							style={{ paddingRight: 3 }}
						>
							<LogoSVG size={35} color={String(neulandGreen)} />
						</AvatarCircle>

						<View className="flex-1 ml-4">
							<Text className="text-white text-lg font-bold opacity-90">
								{memberInfo.name}
							</Text>
							<Text className="text-white text-xs">
								{t(
									hasHonoraryRole
										? 'member:settings.honoraryTitle'
										: 'member:settings.title'
								)}
							</Text>
						</View>

						<PlatformIcon
							ios={{ name: 'chevron.right', size: 10, weight: 'semibold' }}
							android={{ name: 'chevron_right', size: 19 }}
							web={{ name: 'ChevronRight', size: 16 }}
							style={{ color: whiteColor }}
						/>
					</View>
				</LinearGradient>
			</Pressable>
		</View>
	)
}

export default NeulandBox
