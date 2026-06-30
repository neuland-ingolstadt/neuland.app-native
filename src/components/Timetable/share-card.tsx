import moment from 'moment'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import LogoSVG from '@/components/Flow/svgs/logo'
import PlatformIcon from '@/components/Universal/icon'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'

import DetailsBody from './details-body'
import DetailsRow from './details-row'
import DetailsSymbol from './details-symbol'
import Separator from './separator'

interface ShareCardProps {
	event: FriendlyTimetableEntry
}

export default function ShareCard({
	event
}: ShareCardProps): React.JSX.Element {
	const { t } = useTranslation('timetable')
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const labelColor = toColor(useCSSVariable('--color-label'))

	const startDate = new Date(event.startDate)
	const endDate = new Date(event.endDate)

	return (
		<View className="aspect-square bg-background flex gap-1 h-[350px] ps-1.5 pe-6 pt-6">
			<DetailsRow>
				<DetailsSymbol>
					<View
						className="aspect-square rounded-infinite w-[15px]"
						style={{ backgroundColor: primaryColor }}
					/>
				</DetailsSymbol>

				<DetailsBody>
					<Text numberOfLines={2} className="text-text text-xl font-bold">
						{event.name}
					</Text>

					<Text className="text-base" style={{ color: labelColor }}>
						{event.shortName}
					</Text>
				</DetailsBody>
			</DetailsRow>

			<Separator />

			<DetailsRow>
				<DetailsSymbol>
					<PlatformIcon
						ios={{
							name: 'clock',
							size: 21
						}}
						android={{
							name: 'calendar_month',
							size: 24
						}}
						web={{
							name: 'Clock',
							size: 24
						}}
						style={{ color: labelColor }}
					/>
				</DetailsSymbol>

				<DetailsBody>
					<Text className="text-text text-lg">
						{formatFriendlyDate(startDate, {
							weekday: 'long',
							relative: false
						})}
					</Text>

					<View className="items-center flex flex-row gap-1">
						<Text className="text-text text-sm">
							{formatFriendlyTime(startDate)}
						</Text>

						<PlatformIcon
							ios={{
								name: 'chevron.forward',
								size: 12
							}}
							android={{
								name: 'chevron_right',
								size: 16
							}}
							web={{
								name: 'ChevronRight',
								size: 16
							}}
							style={{ color: labelColor }}
						/>

						<Text className="text-text text-sm">
							{formatFriendlyTime(endDate)}
						</Text>

						<Text className="text-sm" style={{ color: labelColor }}>
							{`(${moment(endDate).diff(
								moment(startDate),
								'minutes'
							)} ${t('time.minutes')})`}
						</Text>
					</View>
				</DetailsBody>
			</DetailsRow>

			<Separator />

			<DetailsRow>
				<DetailsSymbol>
					<PlatformIcon
						ios={{
							name: 'mappin.and.ellipse',
							size: 21
						}}
						android={{
							name: 'place',
							size: 24
						}}
						web={{
							name: 'MapPin',
							size: 24
						}}
						style={{ color: labelColor }}
					/>
				</DetailsSymbol>

				<DetailsBody>
					<View className="flex flex-row gap-1">
						{event.rooms.map((room, i) => (
							<Text key={i} className="text-text text-lg">
								{room}
							</Text>
						))}
					</View>
				</DetailsBody>
			</DetailsRow>

			<Separator />

			<DetailsRow>
				<DetailsSymbol>
					<PlatformIcon
						ios={{
							name: 'person',
							size: 21
						}}
						android={{
							name: 'person',
							size: 24
						}}
						web={{
							name: 'User',
							size: 24
						}}
						style={{ color: labelColor }}
					/>
				</DetailsSymbol>

				<DetailsBody>
					<Text className="text-text text-lg">{event.lecturer}</Text>
				</DetailsBody>
			</DetailsRow>

			<View className="items-center bottom-4 flex flex-row gap-1.5 absolute right-6">
				<LogoSVG size={24} />
				<Text className="text-text text-base font-bold">{'Neuland Next'}</Text>
			</View>
		</View>
	)
}
