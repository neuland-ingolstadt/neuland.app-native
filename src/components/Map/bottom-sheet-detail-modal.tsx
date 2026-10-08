import type React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import {
	type DetailSheetPickStartProps,
	IndoorNavStartSheet
} from '@/components/Map/indoor-nav-start-sheet'
import { BottomSheet } from '@/components/Universal/bottom-sheet'
import FormList from '@/components/Universal/form-list'
import PlatformIcon from '@/components/Universal/icon'
import { IosGlassHeaderButton } from '@/components/Universal/share-header-button'
import { useSheetPosition } from '@/components/Universal/use-sheet-position'
import type { FormListSections } from '@/types/components'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import { handleShareModal } from '@/utils/map-actions'
import { toColor } from '@/utils/uniwind-utils'
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
	pickStart: DetailSheetPickStartProps
}

export const BottomSheetDetailModal = ({
	index,
	onIndexChange,
	detents,
	currentPositionModal,
	roomData,
	modalSection,
	pickStart
}: BottomSheetDetailModalProps): React.JSX.Element => {
	const { t } = useTranslation(['common', 'accessibility'])
	const [copied, setCopied] = useState(false)
	const sheetPosition = useSheetPosition(currentPositionModal)
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const pickStartChrome = pickStart.chrome
	const showPickStart = pickStart.active && pickStartChrome != null

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
					{showPickStart ? (
						<View className="flex-1 flex-row items-center gap-1 min-h-10">
							<Pressable
								testID="map-indoor-nav-start-back"
								onPress={pickStartChrome.onBack}
								hitSlop={8}
								accessibilityRole="button"
								accessibilityLabel={pickStartChrome.backAccessibilityLabel}
								className="flex-row items-center py-1 pr-1 -ml-1"
							>
								<PlatformIcon
									ios={{ name: 'chevron.left', size: 20, weight: 'semibold' }}
									android={{ name: 'chevron_left', size: 24 }}
									web={{ name: 'ChevronLeft', size: 20 }}
									style={{ color: primaryColor }}
								/>
							</Pressable>
							<View className="flex-1 min-w-0">
								<Text
									className="text-text ios:text-[22px] ios:leading-7 ios:font-bold android:text-xl android:font-semibold web:text-[22px] web:font-bold"
									numberOfLines={1}
								>
									{pickStartChrome.title}
								</Text>
								<Text
									className="text-label text-[15px] leading-5 mt-0.5"
									numberOfLines={2}
								>
									{pickStartChrome.subtitle}
								</Text>
							</View>
						</View>
					) : (
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
					)}
					<View className="flex-row items-center gap-2 shrink-0 pt-0.5">
						{!showPickStart &&
							roomData.type === SEARCH_TYPES.ROOM &&
							(Platform.OS === 'ios' ? (
								<IosGlassHeaderButton
									testID="map-room-share"
									icon="share"
									compact
									shareCopied={copied}
									label={t('button.share', { ns: 'accessibility' })}
									onPress={() => {
										handleShareModal(roomData.title)
									}}
								/>
							) : (
								<SheetActionButton
									testID="map-room-share"
									accessibilityLabel={t('button.share', {
										ns: 'accessibility'
									})}
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
							))}
						{Platform.OS === 'ios' ? (
							<IosGlassHeaderButton
								testID="map-room-detail-close"
								icon="close"
								compact
								label={t('button.close', { ns: 'accessibility' })}
								onPress={() => {
									onIndexChange(DETAIL_HIDDEN)
								}}
							/>
						) : (
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
						)}
					</View>
				</View>
				{showPickStart ? (
					<View className="mt-3 mb-4 w-full">
						<IndoorNavStartSheet
							key={pickStart.session}
							indoorDataReady={pickStart.indoorDataReady}
							selectedFromId={pickStart.startFromId}
							selectedFromLabel={pickStart.startFromLabel}
							onSelectFrom={pickStart.onSelectFrom}
							onConfirm={pickStart.onConfirm}
							onSearchingChange={pickStart.onSearchingChange}
							onResetStartToDefault={pickStart.onResetToDefault}
						/>
					</View>
				) : (
					<>
						<View className="self-center my-4 w-full">
							<FormList sections={modalSection} />
						</View>
						<RoomReportLink roomTitle={roomData.title} />
					</>
				)}
			</View>
		</BottomSheet>
	)
}
