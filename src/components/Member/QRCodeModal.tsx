import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Animated,
	Modal,
	Platform,
	Pressable,
	Text,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import QRCode from 'react-qr-code'

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
	}
}))

interface QRCodeModalProps {
	visible: boolean
	qrData: string | undefined
	onClose: () => void
}

// Memoized QR Code component to prevent unnecessary re-renders
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
	const scaleAnim = useRef(new Animated.Value(0)).current
	const pulseAnim = useRef(new Animated.Value(0)).current
	const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null)

	// Memoize interpolated values to prevent recalculation on every render
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

	// Memoize animation styles to prevent object recreation
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
				transform: [{ scale: scaleAnim }]
			}
		],
		[styles.modalContent, scaleAnim]
	)

	// Memoize close handler to prevent recreation
	const handleClose = useCallback(() => {
		// Haptic feedback on close
		if (Platform.OS === 'ios') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		}

		// Stop the pulsing animation loop and reset to 0 to hide rings immediately
		if (pulseAnimationRef.current) {
			pulseAnimationRef.current.stop()
			pulseAnimationRef.current = null
		}
		pulseAnim.setValue(0)

		// Create dramatic closing animation
		Animated.parallel([
			// Scale down the modal
			Animated.timing(scaleAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true
			}),
			// Expand and fade out the rings
			Animated.timing(pulseAnim, {
				toValue: 2,
				duration: 300,
				useNativeDriver: true
			})
		]).start(() => onClose())
	}, [pulseAnim, scaleAnim, onClose])

	// Memoize press handler
	const handlePress = useCallback(() => {
		handleClose()
	}, [handleClose])

	useEffect(() => {
		if (visible) {
			// Haptic feedback on open
			if (Platform.OS === 'ios') {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
			}

			// Create the pulsing animation loop
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

			// Create dramatic opening animation
			Animated.parallel([
				// Scale up the modal with bounce effect
				Animated.spring(scaleAnim, {
					toValue: 1,
					tension: 100,
					friction: 8,
					useNativeDriver: true
				}),
				// Start continuous pulsing immediately
				pulseLoop
			]).start()
		} else {
			Animated.timing(scaleAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true
			}).start()
		}

		// Cleanup function to stop animations when component unmounts or visible changes
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
			<Pressable style={styles.modalOverlay} onPress={handlePress}>
				{/* Cool animated background element */}
				<Animated.View style={animatedRingStyle} />
				<Animated.View style={outerRingStyle} />
				<Animated.View style={modalContentStyle}>
					<View style={styles.qrCodeContainer}>
						{qrData ? (
							<MemoizedQRCode qrData={qrData} />
						) : (
							<ActivityIndicator size="large" color={theme.colors.text} />
						)}
					</View>

					<Text style={styles.closeText}>{t('qrCode.tapToClose')}</Text>
				</Animated.View>
			</Pressable>
		</Modal>
	)
})
