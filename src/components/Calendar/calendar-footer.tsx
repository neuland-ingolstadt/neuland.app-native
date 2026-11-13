import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

interface CalendarFooterProps {
	onLinkPress: () => void
}

export function CalendarFooter({
	onLinkPress
}: CalendarFooterProps): React.JSX.Element {
	const { t } = useTranslation('common')

	return (
		<View className="my-1 pb-bottom-safe">
			<Text className="text-label text-xs font-normal pb-[25px] text-justify">
				{t('pages.calendar.footer.part1')}
				<Text className="text-text font-semibold" onPress={onLinkPress}>
					{t('pages.calendar.footer.part2')}
				</Text>
				{t('pages.calendar.footer.part3')}
			</Text>
		</View>
	)
}
