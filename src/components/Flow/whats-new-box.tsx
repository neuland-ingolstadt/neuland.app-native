import type React from 'react'
import { Text, View } from 'react-native'
import type { MaterialIcon } from '@/types/material-icons'
import { hairlineBorder } from '@/utils/uniwind-utils'

import PlatformIcon, { type LucideIcon } from '../Universal/icon'

interface WhatsNewBoxProps {
	title: string
	description: string
	icon: { ios: string; android: MaterialIcon; web: LucideIcon }
}

/**
 * A component that renders a box with a title, description and an icon.
 * @param {string} title - The title of the box.
 * @param {string} description - The description of the box.
 * @param {string} icon - The icon of the box.
 * @returns {React.JSX.Element} - A React component that renders the box.
 * @example
 * <WhatsNewBox title="Title" description="Description" icon="chevron-forward-circle" />
 */
const WhatsNewBox = ({
	title,
	description,
	icon
}: WhatsNewBoxProps): React.JSX.Element => {
	return (
		<View
			className="items-center bg-card-contrast rounded-2xl flex-row gap-4 px-5 py-4 w-full border-border"
			style={hairlineBorder}
		>
			<View className="bg-primary-background rounded-2xl p-3 shrink-0">
				<PlatformIcon
					ios={{
						name: icon.ios,
						size: 26,
						variableValue: 1
					}}
					android={{
						name: icon.android,
						size: 28
					}}
					web={{
						name: icon.web,
						size: 28
					}}
				/>
			</View>

			<View className="flex-col shrink gap-1">
				<Text
					className="text-text text-base font-semibold text-left"
					numberOfLines={2}
				>
					{title}
				</Text>
				<Text
					className="text-label text-sm leading-[17px] text-left"
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={4}
				>
					{description}
				</Text>
			</View>
		</View>
	)
}

export default WhatsNewBox
