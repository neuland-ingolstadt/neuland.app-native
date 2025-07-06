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
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import QRCode from 'react-qr-code'
import PlatformIcon from '@/components/Universal/Icon'

const stylesheet = createStyleSheet(() => ({
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.85)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	animatedRing: {
		position: 'absolute',
		width: 400,
		height: 400,
		borderRadius: 200,
		borderWidth: 2,
		borderColor: '#00ff33'
	},
	outerRing: {
		position: 'absolute',
		width: 500,
		height: 500,
		borderRadius: 250,
		borderWidth: 1,
		borderColor: '#00ff33'
	},
	modalContent: {
		backgroundColor: '#fff',
		borderRadius: 20,
		padding: 24,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 10,
		position: 'relative',
		zIndex: 1
	},
	qrCodeContainer: {
		width: 280,
		height: 280,
		alignItems: 'center',
		justifyContent: 'center'
	},
	closeText: {
		marginTop: 18,
		color: '#222',
		fontWeight: '600',
		fontSize: 16,
		textAlign: 'center'
	},
	faqButton: {
		position: 'absolute',
		top: 70,
		right: 15,
		zIndex: 10
	},
	faqIcon: {
		color: 'rgba(255, 255, 255, 0.8)'
	}
}))

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
	const { styles, theme } = useStyles(stylesheet)
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
			styles.animatedRing,
			{
				transform: [{ scale: pulseScale }],
				opacity: pulseOpacity
			}
		],
		[styles.animatedRing, pulseScale, pulseOpacity]
	)

	const outerRingStyle = useMemo(
		() => [
			styles.outerRing,
			{
				transform: [{ scale: pulseScale }],
				opacity: outerPulseOpacity
			}
		],
		[styles.outerRing, pulseScale, outerPulseOpacity]
	)

	const modalContentStyle = useMemo(
		() => [
			styles.modalContent,
			{
				transform: [{ scale: scaleAnim }],
				opacity: Animated.multiply(scaleAnim, contentOpacityAnim)
			}
		],
		[styles.modalContent, scaleAnim, contentOpacityAnim]
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
	}, [pulseAnim, scaleAnim, onClose, isClosing])

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
	}, [visible, scaleAnim, pulseAnim])

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={handleClose}
		>
			<Pressable
				style={styles.modalOverlay}
				onPress={isClosing ? undefined : handlePress}
			>
				<Animated.View style={animatedRingStyle} />
				<Animated.View style={outerRingStyle} />
				<Animated.View style={modalContentStyle} pointerEvents="auto">
					<View style={styles.qrCodeContainer}>
						{qrData ? (
							<MemoizedQRCode qrData={qrData} />
						) : (
							<ActivityIndicator size="large" color={theme.colors.text} />
						)}
					</View>

					<Text style={styles.closeText}>{t('qrCode.tapToClose')}</Text>
				</Animated.View>

				{/* FAQ Button */}
				<Pressable
					style={styles.faqButton}
					onPress={(e) => {
						e.stopPropagation()
						void Linking.openURL('http://id.neuland-ingolstadt.de/learn-more')
					}}
				>
					<PlatformIcon
						style={styles.faqIcon}
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
