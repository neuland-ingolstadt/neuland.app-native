import { router } from 'expo-router'
import type React from 'react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { BottomSheet } from '@/components/Universal/bottom-sheet'
import { useSheetPosition } from '@/components/Universal/use-sheet-position'
import type { FormListSections } from '@/types/components'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import type { MaterialIcon } from '@/types/material-icons'
import { handleShareModal } from '@/utils/map-actions'
import { toColor } from '@/utils/uniwind-utils'
import FormList from '../Universal/form-list'
import PlatformIcon, { type WebIcon } from '../Universal/icon'
import BottomSheetBackground from './bottom-sheet-background'
import { MapSheetHandle } from './map-sheet-handle'
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

interface ReportLinkProps {
	roomTitle: string
}

interface SheetActionButtonProps {
	testID: string
	accessibilityLabel: string
	onPress: () => void
	iosFilledSymbol: string
	androidName: MaterialIcon
	webName: WebIcon
}

const IOS_ACTION_SIZE = 38

const SheetActionButton = ({
	testID,
	accessibilityLabel,
	onPress,
	iosFilledSymbol,
	androidName,
	webName
}: SheetActionButtonProps): React.JSX.Element => {
	const labelColor = String(
		toColor(useCSSVariable('--color-label-secondary')) ?? '#8e8e93'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')

	return (
		<Pressable
			testID={testID}
			accessible
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			onPress={onPress}
			hitSlop={8}
			className={
				Platform.OS === 'ios'
					? 'items-center justify-center'
					: 'h-10 w-10 items-center justify-center rounded-full bg-label-background'
			}
			style={
				Platform.OS === 'ios'
					? { width: IOS_ACTION_SIZE, height: IOS_ACTION_SIZE }
					: undefined
			}
		>
			<PlatformIcon
				ios={{
					name: iosFilledSymbol,
					size: IOS_ACTION_SIZE - 7,
					renderMode: 'hierarchical'
				}}
				android={{ name: androidName, size: 22 }}
				web={{ name: webName, size: 18 }}
				style={{
					color: Platform.OS === 'ios' ? labelColor : textColor,
					...(Platform.OS === 'ios'
						? { width: IOS_ACTION_SIZE, height: IOS_ACTION_SIZE }
						: {})
				}}
			/>
		</Pressable>
	)
}

const ReportLink = ({ roomTitle }: ReportLinkProps): React.JSX.Element => {
	const { t } = useTranslation('common')
	const labelColor = toColor(useCSSVariable('--color-label'))

	const handleReportRoom = useCallback(() => {
		router.navigate({
			pathname: '/room-report',
			params: { room: roomTitle }
		})
	}, [roomTitle])

	return (
		<View className="py-2.5">
			<Pressable
				testID="map-room-report"
				onPress={() => handleReportRoom()}
				className="items-center flex-row gap-1"
			>
				<Text className="text-[15px] ps-1" style={{ color: labelColor }}>
					{t('pages.map.details.room.report')}
				</Text>
				<PlatformIcon
					style={{ color: labelColor }}
					ios={{
						name: 'chevron.forward',
						size: 6
					}}
					android={{
						name: 'chevron_right',
						size: 16
					}}
					web={{
						name: 'ChevronRight',
						size: 16
					}}
				/>
			</Pressable>
		</View>
	)
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
				<ReportLink roomTitle={roomData.title} />
			</View>
		</BottomSheet>
	)
}
