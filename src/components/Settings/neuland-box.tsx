import { useRouter } from 'expo-router'
import { t } from 'i18next'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import LogoSVG from '@/components/Flow/svgs/logo'
import PlatformIcon from '@/components/Universal/Icon'
import { useMemberStore } from '@/hooks/useMemberStore'
import AvatarCircle from './avatar-circle'

const NeulandBox = () => {
	const { styles, theme } = useStyles(stylesheet)
	const router = useRouter()
	const memberInfo = useMemberStore((s) => s.info)

	if (Platform.OS === 'web') {
		return null
	}

	if (!memberInfo) {
		return null
	}

	return (
		<View style={styles.neulandContainer}>
			<Pressable
				onPress={() => router.push('/(screens)/member')}
				style={styles.neulandBox}
			>
				<View style={styles.neulandBoxContent}>
					<AvatarCircle
						background={`${theme.colors.primary}25`}
						size={50}
						style={styles.neulandAvatar}
					>
						<LogoSVG size={35} color={theme.colors.primary} />
					</AvatarCircle>

					<View>
						<Text style={styles.neulandTitle}>
							{t('member:settings.title')}
						</Text>
						<Text style={styles.neulandName}>{memberInfo.name}</Text>
					</View>
				</View>
				<PlatformIcon
					ios={{ name: 'chevron.right', size: 14 }}
					android={{ name: 'chevron_right', size: 24 }}
					web={{ name: 'ChevronRight', size: 24 }}
					style={styles.neulandChevron}
				/>
			</Pressable>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	neulandContainer: {
		marginTop: 10,
	},
	neulandBox: {
		flex: 1,
		padding: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		borderRadius:Platform.OS === 'ios' ? 26 : theme.radius.mg,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border
	},
	neulandBoxContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16
	},
	neulandTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600'
	},
	neulandName: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14,
		marginTop: 4
	},
	neulandChevron: {
		color: theme.colors.labelSecondaryColor
	},
	neulandAvatar: {
		paddingRight: 3
	}
}))

export default NeulandBox
