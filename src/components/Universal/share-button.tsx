import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import PlatformIcon from './icon'

interface ShareButtonProps {
	onPress?: () => void
}

export default function ShareButton({
	onPress
}: ShareButtonProps): React.JSX.Element {
	const { t } = useTranslation('common')

	return (
		<Pressable
			className="self-center bg-card rounded-md mt-1.5 px-[45px] py-3"
			onPress={onPress}
		>
			<View className="items-center flex-row gap-2.5">
				<PlatformIcon
					ios={{ name: 'square.and.arrow.up', size: 15 }}
					android={{ name: 'share', size: 18 }}
					web={{ name: 'Share', size: 18 }}
				/>
				<Text className="text-primary text-[17px]">{t('misc.share')}</Text>
			</View>
		</Pressable>
	)
}
