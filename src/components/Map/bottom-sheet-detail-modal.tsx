import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import Color from 'color'
import { router } from 'expo-router'
import type React from 'react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import {
	StyledBottomSheetModal,
	StyledBottomSheetView
} from '@/components/Universal/styled'
import type { FormListSections } from '@/types/components'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import { handleShareModal } from '@/utils/map-utils'
import { toColor } from '@/utils/uniwind-utils'
import FormList from '../Universal/form-list'
import PlatformIcon from '../Universal/icon'
import BottomSheetBackground from './bottom-sheet-background'

interface BottomSheetDetailModalProps {
	bottomSheetModalRef: React.RefObject<
		import('@gorhom/bottom-sheet').BottomSheetModal | null
	>
	handleSheetChangesModal: () => void
	currentPositionModal: SharedValue<number>
	roomData: RoomData
	modalSection: FormListSections[]
}

interface ReportLinkProps {
	roomTitle: string
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
	bottomSheetModalRef,
	handleSheetChangesModal,
	currentPositionModal,
	roomData,
	modalSection
}: BottomSheetDetailModalProps): React.JSX.Element => {
	const [copied, setCopied] = useState(false)
	const labelTertiaryColor = toColor(useCSSVariable('--color-label-tertiary'))
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')
	const iconColor = Color(textColor).darken(0.1).hex()
	const IOS_SNAP_POINTS = ['39%', '57%', '85%']
	const DEFAULT_SNAP_POINTS = ['30%', '40%', '70%']
	return (
		<BottomSheetModalProvider>
			<StyledBottomSheetModal
				index={0}
				// @ts-expect-error withUniwind ref generic mismatch
				ref={bottomSheetModalRef}
				snapPoints={
					Platform.OS === 'ios' ? IOS_SNAP_POINTS : DEFAULT_SNAP_POINTS
				}
				onDismiss={handleSheetChangesModal}
				backgroundComponent={BottomSheetBackground}
				animatedPosition={currentPositionModal}
				handleIndicatorStyle={{ backgroundColor: labelTertiaryColor }}
			>
				<StyledBottomSheetView className="flex-1 px-page">
					<View className="flex-row justify-between pb-0">
						<Text className="text-text text-[26px] font-semibold text-left">
							{roomData.title}
						</Text>
						<View className="flex-row gap-2.5 mb-[3px]">
							{roomData.type === SEARCH_TYPES.ROOM && (
								<Pressable
									onPress={() => {
										if (Platform.OS === 'web') {
											setCopied(true)
											setTimeout(() => setCopied(false), 1000)
										}
										handleShareModal(roomData.title)
									}}
									className="items-center bg-card rounded-[25px] h-[34px] justify-center p-[7px] w-[34px]"
								>
									<PlatformIcon
										ios={{
											name: copied ? 'checkmark' : 'square.and.arrow.up',
											size: 14,
											weight: 'bold'
										}}
										android={{
											name: copied ? 'check' : 'share',
											size: 16
										}}
										web={{
											name: copied ? 'Check' : 'Share',
											size: 16
										}}
										style={{
											color: iconColor,
											marginRight: Platform.OS === 'android' ? 2 : 0,
											marginBottom: Platform.OS === 'ios' ? 3 : 0
										}}
									/>
								</Pressable>
							)}
							<Pressable
								onPress={() => {
									bottomSheetModalRef.current?.close()
								}}
							>
								<View className="items-center bg-card rounded-[25px] h-[34px] justify-center p-[7px] w-[34px]">
									<PlatformIcon
										ios={{
											name: 'xmark',
											size: 13,
											weight: 'bold'
										}}
										android={{
											name: 'expand_more',
											size: 22
										}}
										web={{
											name: 'X',
											size: 22
										}}
										style={{
											color: iconColor,
											marginTop: Platform.OS === 'ios' ? 1 : 0
										}}
									/>
								</View>
							</Pressable>
						</View>
					</View>
					<Text className="text-text text-base">{roomData.subtitle}</Text>
					<View className="self-center my-4 w-full">
						<FormList sections={modalSection} />
					</View>
					<ReportLink roomTitle={roomData.title} />
				</StyledBottomSheetView>
			</StyledBottomSheetModal>
		</BottomSheetModalProvider>
	)
}
