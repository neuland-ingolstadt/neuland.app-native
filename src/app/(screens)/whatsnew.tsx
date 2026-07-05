import * as Application from 'expo-application'
import { Redirect, router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { WhatsNewItem } from '@/components/Flow/whats-new-item'
import changelogData from '@/data/changelog.json'
import { useFlowStore } from '@/hooks/useFlowStore'
import type { LanguageKey } from '@/localization/i18n'
import type { Changelog, Version } from '@/types/data'
import { convertToMajorMinorPatch } from '@/utils/app-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function WhatsNewScreen(): React.JSX.Element {
	const version = convertToMajorMinorPatch(
		Application.nativeApplicationVersion ?? '0.0.0'
	)
	const changelog = changelogData as Changelog
	const items = changelog.version[version]

	if (items === undefined) {
		return <Redirect href="/(tabs)" />
	}

	return <WhatsNewContent version={version} items={items} />
}

interface WhatsNewContentProps {
	version: string
	items: Version[]
}

function WhatsNewContent({
	version,
	items
}: WhatsNewContentProps): React.JSX.Element {
	const { t, i18n } = useTranslation('flow')
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const buttonTextColor = getContrastColor(primaryColor)
	const toggleUpdated = useFlowStore((state) => state.toggleUpdated)
	const language = i18n.language as LanguageKey

	return (
		<View className="bg-contrast flex-1 gap-5 px-5 py-10">
			<View className="flex-1 justify-end">
				<Text className="text-text text-[32px] font-bold pb-2.5 text-center">
					{t('whatsnew.title')}
				</Text>
				<Text className="text-label text-sm text-center">
					{t('whatsnew.version', {
						version
					})}
				</Text>
			</View>

			<View className="flex-[4] justify-center gap-3">
				{items.map(({ title, description, icon }, index) => (
					<WhatsNewItem
						key={title[language]}
						title={title[language]}
						description={description[language]}
						icon={icon}
						index={index}
					/>
				))}
			</View>
			<View className="flex-1">
				<Pressable
					className="self-center bg-primary rounded-md px-5 py-[15px] w-1/2"
					onPress={() => {
						toggleUpdated()
						router.replace('/(tabs)')
					}}
				>
					<Text
						className="text-[15px] font-semibold text-center"
						style={{ color: buttonTextColor }}
					>
						{t('whatsnew.continue')}
					</Text>
				</Pressable>
			</View>
		</View>
	)
}
