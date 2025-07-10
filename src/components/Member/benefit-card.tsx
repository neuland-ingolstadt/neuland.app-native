import type React from 'react'
import { Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/Icon'
import type { MaterialIcon } from '@/types/material-icons'
import { stylesheet } from './styles'

interface BenefitCardProps {
	title: string
	description: string
	icon: {
		ios: { name: string; size: number }
		android: { name: MaterialIcon; size: number }
		web: { name: LucideIcon; size: number }
	}
}

export function BenefitCard({
	title,
	description,
	icon
}: BenefitCardProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)

	return (
		<View style={styles.benefitCard}>
			<View style={styles.benefitIconContainer}>
				<PlatformIcon
					ios={icon.ios}
					android={icon.android}
					web={icon.web}
					style={styles.benefitIcon}
				/>
			</View>
			<View style={styles.benefitTextContainer}>
				<Text style={styles.benefitTitle}>{title}</Text>
				<Text style={styles.benefitDescription}>{description}</Text>
			</View>
		</View>
	)
}
