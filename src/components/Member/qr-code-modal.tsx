import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Animated,
	Linking,
	Modal,
	Platform,
	Pressable,
	Text,
	View
} from 'react-native'
import QRCode from 'react-qr-code'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'

interface QRCodeModalProps {
	visible: boolean
	qrData: string | undefined
	onClose: () => void
}

const MemoizedQRCode = React.memo(({ qrData }: { qrData: string }) => (
	<QRCode
		value={qrData}
		size={280}
		bgColor="#ffffff"
		fgColor="#000000"
		level="M"
	/>
))

MemoizedQRCode.displayName = 'MemoizedQRCode'

export const QRCodeModal = React.memo(function QRCodeModal({
	visible,
	qrData,
	onClose
}: QRCodeModalProps): React.JSX.Element {
	const { t } = useTranslation('member')
	const textColor = toColor(useCSSVariable('--color-text'))
	const [isClosing, setIsClosing] = useState(false)
	const scaleAnim = useRef(new Animated.Value(0)).current
	const pulseAnim = useRef(new Animated.Value(0)).current
	const contentOpacityAnim = useRef(new Animated.Value(1)).current
	const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null)

	const pulseScale = useMemo(
		() =>
			pulseAnim.interpolate({
				inputRange: [0, 1, 2],
				outputRange: [1, 1.1, 2.5]
			}),
		[pulseAnim]
	)

	const pulseOpacity = useMemo(
		() =>
			pulseAnim.interpolate({
				inputRange: [0, 1, 2],
				outputRange: [0.3, 0.7, 0]
			}),
		[pulseAnim]
	)

	const outerPulseOpacity = useMemo(
		() =>
			pulseAnim.interpolate({
				inputRange: [0, 1, 2],
				outputRange: [0.1, 0.3, 0]
			}),
		[pulseAnim]
	)

	const animatedRingStyle = useMemo(
		() => [
			{
				position: 'absolute' as const,
				width: 400,
				height: 400,
				borderRadius: 200,
				borderWidth: 2,
				borderColor: '#00ff33'
			},
			{
				transform: [{ scale: pulseScale }],
				opacity: pulseOpacity
			}
		],
		[pulseScale, pulseOpacity]
	)

	const outerRingStyle = useMemo(
		() => [
			{
				position: 'absolute' as const,
				width: 500,
				height: 500,
				borderRadius: 250,
				borderWidth: 1,
				borderColor: '#00ff33'
			},
			{
				transform: [{ scale: pulseScale }],
				opacity: outerPulseOpacity
			}
		],
		[pulseScale, outerPulseOpacity]
	)

	const modalContentStyle = useMemo(
		() => [
			{
				backgroundColor: '#fff',
				borderRadius: 20,
				padding: 24,
				alignItems: 'center' as const,
				justifyContent: 'center' as const,
				elevation: 10,
				position: 'relative' as const,
				zIndex: 1
			},
			{
				transform: [{ scale: scaleAnim }],
				opacity: Animated.multiply(scaleAnim, contentOpacityAnim)
			}
		],
		[scaleAnim, contentOpacityAnim]
	)

	const handleClose = useCallback(() => {
		if (isClosing) return

		setIsClosing(true)

		if (Platform.OS === 'ios') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		}

		if (pulseAnimationRef.current) {
			pulseAnimationRef.current.stop()
			pulseAnimationRef.current = null
		}
		pulseAnim.setValue(0)

		Animated.parallel([
			Animated.timing(scaleAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true
			}),
			Animated.timing(contentOpacityAnim, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true
			}),
			Animated.timing(pulseAnim, {
				toValue: 2,
				duration: 300,
				useNativeDriver: true
			})
		]).start(() => onClose())
	}, [pulseAnim, scaleAnim, onClose, isClosing, contentOpacityAnim])

	const handlePress = useCallback(() => {
		handleClose()
	}, [handleClose])

	useEffect(() => {
		if (visible) {
			setIsClosing(false)

			if (Platform.OS === 'ios') {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
			}

			const pulseLoop = Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 2000,
						useNativeDriver: true
					}),
					Animated.timing(pulseAnim, {
						toValue: 0,
						duration: 2000,
						useNativeDriver: true
					})
				])
			)
			pulseAnimationRef.current = pulseLoop

			contentOpacityAnim.setValue(1)

			Animated.parallel([
				Animated.spring(scaleAnim, {
					toValue: 1,
					tension: 100,
					friction: 8,
					useNativeDriver: true
				}),
				pulseLoop
			]).start()
		} else {
			setIsClosing(true)

			if (pulseAnimationRef.current) {
				pulseAnimationRef.current.stop()
				pulseAnimationRef.current = null
			}

			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(contentOpacityAnim, {
					toValue: 0,
					duration: 100,
					useNativeDriver: true
				}),
				Animated.timing(pulseAnim, {
					toValue: 2,
					duration: 300,
					useNativeDriver: true
				})
			]).start()
		}

		return () => {
			scaleAnim.stopAnimation()
			if (pulseAnimationRef.current) {
				pulseAnimationRef.current.stop()
				pulseAnimationRef.current = null
			}
			pulseAnim.stopAnimation()
		}
	}, [visible, scaleAnim, pulseAnim, contentOpacityAnim])

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={handleClose}
		>
			<Pressable
				className="flex-1 bg-black/85 justify-center items-center"
				onPress={isClosing ? undefined : handlePress}
			>
				<Animated.View style={animatedRingStyle} />
				<Animated.View style={outerRingStyle} />
				<Animated.View style={modalContentStyle} pointerEvents="auto">
					<View className="w-[280px] h-[280px] items-center justify-center">
						{qrData ? (
							<MemoizedQRCode qrData={qrData} />
						) : (
							<ActivityIndicator size="large" color={textColor} />
						)}
					</View>

					<Text className="mt-[18px] text-[#222] font-semibold text-base text-center">
						{t('qrCode.tapToClose')}
					</Text>
				</Animated.View>

				<Pressable
					className="absolute top-[70px] right-[15px] z-10"
					hitSlop={15}
					onPress={(e) => {
						e.stopPropagation()
						void Linking.openURL('http://id.neuland-ingolstadt.de/learn-more')
					}}
				>
					<PlatformIcon
						style={{ color: 'rgba(255, 255, 255, 0.8)' }}
						ios={{
							name: 'questionmark.circle',
							size: 20,
							variableValue: 1
						}}
						android={{
							name: 'help',
							size: 25,
							variant: 'outlined'
						}}
						web={{
							name: 'CircleQuestionMark',
							size: 25
						}}
					/>
				</Pressable>
			</Pressable>
		</Modal>
	)
})
