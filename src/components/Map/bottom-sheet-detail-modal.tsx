import type React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Text, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { BottomSheet } from '@/components/Universal/bottom-sheet'
import { useSheetPosition } from '@/components/Universal/use-sheet-position'
import type { FormListSections } from '@/types/components'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import { handleShareModal } from '@/utils/map-actions'
import FormList from '../Universal/form-list'
import BottomSheetBackground from './bottom-sheet-background'
import { MapSheetHandle } from './map-sheet-handle'
import { RoomReportLink } from './room-report-link'
import { SheetActionButton } from './sheet-action-button'
import { sheetHostStyle } from './sheet-chrome'
import { DETAIL_HIDDEN } from './sheet-detents'

interface BottomSheetDetailModalProps {
	index: number
	onIndexChange: (index: number) => void
	detents: number[]
	currentPositionModal: SharedValue<number>
	roomData: RoomData
	modalSection: FormListSections[]
}

export const BottomSheetDetailModal = ({
	index,
	onIndexChange,
	detents,
	currentPositionModal,
	roomData,
	modalSection
}: BottomSheetDetailModalProps): React.JSX.Element => {
	const { t } = useTranslation(['common', 'accessibility'])
	const [copied, setCopied] = useState(false)
	const sheetPosition = useSheetPosition(currentPositionModal)

	return (
		<BottomSheet
			index={index}
			detents={detents}
			animateIn={false}
			surface={<BottomSheetBackground />}
			onIndexChange={onIndexChange}
			style={sheetHostStyle}
			{...sheetPosition}
		>
			<View testID="map-room-detail" className="flex-1 px-page">
				<MapSheetHandle />
				<View className="flex-row items-start gap-3 px-2 mt-1">
					<View className="flex-1 shrink">
						<Text
							className="text-text ios:text-[28px] ios:leading-8.5 ios:font-bold android:text-2xl android:leading-8 android:font-semibold web:text-[28px] web:leading-8.5 web:font-bold"
							numberOfLines={2}
						>
							{roomData.title}
						</Text>
						{roomData.subtitle !== '' && (
							<Text
								className="text-label text-[15px] leading-5 mt-0.5"
								numberOfLines={2}
							>
								{roomData.subtitle}
							</Text>
						)}
					</View>
					<View className="flex-row items-center gap-2 shrink-0 pt-0.5">
						{roomData.type === SEARCH_TYPES.ROOM && (
							<SheetActionButton
								testID="map-room-share"
								accessibilityLabel={t('button.share', { ns: 'accessibility' })}
								onPress={() => {
									if (Platform.OS === 'web') {
										setCopied(true)
										setTimeout(() => setCopied(false), 1000)
									}
									handleShareModal(roomData.title)
								}}
								iosFilledSymbol={
									copied
										? 'checkmark.circle.fill'
										: 'square.and.arrow.up.circle.fill'
								}
								androidName={copied ? 'check' : 'share'}
								webName={copied ? 'Check' : 'Share'}
							/>
						)}
						<SheetActionButton
							testID="map-room-detail-close"
							accessibilityLabel={t('button.close', { ns: 'accessibility' })}
							onPress={() => {
								onIndexChange(DETAIL_HIDDEN)
							}}
							iosFilledSymbol="xmark.circle.fill"
							androidName="close"
							webName="X"
						/>
					</View>
				</View>
				<View className="self-center my-4 w-full">
					<FormList sections={modalSection} />
				</View>
				<RoomReportLink roomTitle={roomData.title} />
			</View>
		</BottomSheet>
	)
}
