import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import type React from 'react'
import { useEffect, useRef } from 'react'
import {
	Linking,
	Pressable,
	Animated as RNAnimated,
	ScrollView,
	Text,
	View
} from 'react-native'
import Animated, {
	interpolate,
	SensorType,
	useAnimatedSensor,
	useAnimatedStyle,
	withSpring
} from 'react-native-reanimated'
import { useStyles } from 'react-native-unistyles'
import QRCode from 'react-qr-code'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import FormList from '@/components/Universal/FormList'
import PlatformIcon from '@/components/Universal/Icon'
import type { MemberInfo } from '@/hooks/useMemberStore'
import type { FormListSections } from '@/types/components'
import { stylesheet } from './styles'

const quickLinksSections: FormListSections[] = [
	{
		items: [
			{
				title: 'Neuland Website',
				onPress: () => Linking.openURL('https://neuland-ingolstadt.de'),
				icon: {
					ios: 'globe',
					android: 'public',
					web: 'Globe'
				}
			},
			{
				title: 'Wiki',
				onPress: () => Linking.openURL('https://wiki.informatik.sexy'),
				icon: {
					ios: 'book.closed',
					android: 'menu_book',
					web: 'BookOpen'
				}
			},
			{
				title: 'SSO Profile',
				onPress: () => Linking.openURL('https://sso.informatik.sexy/'),
				icon: {
					ios: 'person.crop.circle',
					android: 'account_circle',
					web: 'User'
				}
			}
		]
	}
]

function AnimatedSecurityLine(): React.JSX.Element {
	const animatedValue = useRef(new RNAnimated.Value(0)).current

	useEffect(() => {
		const startAnimation = () => {
			RNAnimated.loop(
				RNAnimated.sequence([
					RNAnimated.timing(animatedValue, {
						toValue: 1,
						duration: 2000,
						useNativeDriver: false
					}),
					RNAnimated.timing(animatedValue, {
						toValue: 0,
						duration: 2000,
						useNativeDriver: false
					})
				])
			).start()
		}

		startAnimation()
	}, [animatedValue])

	const translateX = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [-200, 200]
	})

	return (
		<View
			style={{ height: 2, overflow: 'hidden', marginTop: 8, width: '100%' }}
		>
			<RNAnimated.View
				style={{
					height: 2,
					width: '100%',
					backgroundColor: '#00ff33',
					transform: [{ translateX }],
					opacity: 0.8
				}}
			/>
		</View>
	)
}

function InteractiveIDCard({ info }: { info: MemberInfo }): React.JSX.Element {
	const { styles } = useStyles(stylesheet)

	const gyroscope = useAnimatedSensor(SensorType.GYROSCOPE, {
		interval: 16 // 60fps
	})

	const cardAnimatedStyle = useAnimatedStyle(() => {
		const { x, y } = gyroscope.sensor.value
		const translateX = interpolate(x, [-1, 1], [-2, 2], 'clamp')
		const translateY = interpolate(y, [-1, 1], [-2, 2], 'clamp')
		const rotateX = interpolate(y, [-1, 1], [-0.5, 0.5], 'clamp')
		const rotateY = interpolate(x, [-1, 1], [-0.5, 0.5], 'clamp')

		return {
			transform: [
				{ translateX: withSpring(translateX, { damping: 15, stiffness: 100 }) },
				{ translateY: withSpring(translateY, { damping: 15, stiffness: 100 }) },
				{ rotateX: `${rotateX}deg` },
				{ rotateY: `${rotateY}deg` }
			]
		}
	})

	const logoAnimatedStyle = useAnimatedStyle(() => {
		const { x, y } = gyroscope.sensor.value
		const translateX = interpolate(x, [-1, 1], [-1, 1], 'clamp')
		const translateY = interpolate(y, [-1, 1], [-1, 1], 'clamp')
		const scale = interpolate(
			Math.abs(x) + Math.abs(y),
			[0, 1],
			[1, 1.01],
			'clamp'
		)

		return {
			transform: [
				{ translateX: withSpring(translateX, { damping: 20, stiffness: 150 }) },
				{ translateY: withSpring(translateY, { damping: 20, stiffness: 150 }) },
				{ scale: withSpring(scale, { damping: 20, stiffness: 150 }) }
			]
		}
	})

	const qrCodeAnimatedStyle = useAnimatedStyle(() => {
		const { x, y } = gyroscope.sensor.value
		const translateX = interpolate(x, [-1, 1], [-0.5, 0.5], 'clamp')
		const translateY = interpolate(y, [-1, 1], [-0.5, 0.5], 'clamp')

		return {
			transform: [
				{ translateX: withSpring(translateX, { damping: 25, stiffness: 200 }) },
				{ translateY: withSpring(translateY, { damping: 25, stiffness: 200 }) }
			]
		}
	})

	const handleGroupPress = (_groupName: string) => {
		Haptics.selectionAsync()
	}

	return (
		<>
			<Animated.View style={[styles.idCardContainer, cardAnimatedStyle]}>
				<Animated.View style={styles.shadow}>
					<LinearGradient
						colors={['#0f0f0f', '#001f05']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.idCard}
					>
						<View style={styles.cardHeader}>
							<Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
								<LogoTextSVG size={16} color="#00ff33" />
							</Animated.View>
							<View style={styles.titleContainer}>
								<Text style={styles.cardTitle}>NEULAND ID</Text>
								<AnimatedSecurityLine />
							</View>
						</View>

						<View style={styles.cardContent}>
							<View style={styles.nameSection}>
								<Text style={styles.nameLabel}>NAME</Text>
								<Text style={styles.name}>{info.name}</Text>
							</View>

							{info.preferred_username && (
								<View style={styles.usernameSection}>
									<Text style={styles.fieldLabel}>USERNAME</Text>
									<Text style={styles.username}>
										@{info.preferred_username}
									</Text>
								</View>
							)}

							{info.email && (
								<View style={styles.emailSection}>
									<Text style={styles.fieldLabel}>EMAIL</Text>
									<Text style={styles.email}>{info.email}</Text>
								</View>
							)}
							<Animated.View
								style={[styles.qrCodeContainer, qrCodeAnimatedStyle]}
							>
								<QRCode
									value={(info.aud as string) ?? ''}
									size={100}
									bgColor="#ffffff"
									fgColor="#000000"
									level="M"
								/>
							</Animated.View>
						</View>

						{info.groups && info.groups.length > 0 && (
							<View style={styles.cardFooter}>
								<View style={styles.footerLine} />
								<Text style={styles.footerText}>MEMBER GROUPS</Text>
							</View>
						)}
					</LinearGradient>
				</Animated.View>
			</Animated.View>

			{info.groups && info.groups.length > 0 && (
				<View style={styles.groupList}>
					<Text style={styles.groupTitle}>Your Groups</Text>
					<View style={styles.groupContainer}>
						{info.groups.map((group) => (
							<Pressable
								key={group}
								style={({ pressed }) => [
									styles.groupBadge,
									pressed && styles.groupBadgePressed
								]}
								onPress={() => handleGroupPress(group)}
							>
								<Text style={styles.groupText}>{group}</Text>
							</Pressable>
						))}
					</View>
				</View>
			)}
		</>
	)
}

interface LoggedInViewProps {
	info: MemberInfo | null
	logout: () => void
}

export function LoggedInView({
	info,
	logout
}: LoggedInViewProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{info && (
				<View style={styles.cardWrapper}>
					<InteractiveIDCard info={info} />
				</View>
			)}
			<FormList sections={quickLinksSections} />

			<Pressable onPress={logout} style={styles.logoutButton}>
				<PlatformIcon
					ios={{
						name: 'rectangle.portrait.and.arrow.right',
						size: 18
					}}
					android={{
						name: 'logout',
						size: 22
					}}
					web={{
						name: 'LogOut',
						size: 22
					}}
					style={styles.notification}
				/>
				<Text style={styles.logoutText}>Logout</Text>
			</Pressable>
		</ScrollView>
	)
}
