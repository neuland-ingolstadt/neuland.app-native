import type React from 'react'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'

interface NameBoxProps {
	children: ReactNode
	title: string
	subTitle1: string
	subTitle2?: string
	showChevron?: boolean
}

/**
 * A component that displays a box with a title and two subtitles.
 *
 * @param {NameBoxProps} props - The props object.
 * @param {ReactNode} props.children - The children of the component.
 * @param {string} props.title - The title of the box.
 * @param {string} props.subTitle1 - The first subtitle of the box.
 * @param {string} [props.subTitle2] - The second subtitle of the box (optional).
 * @param {boolean} [props.showChevron] - Whether to show the chevron icon (optional).
 * @returns {JSX.Element} - The JSX element representing the component.
 */
const NameBox = ({
	children,
	title,
	subTitle1,
	subTitle2,
	showChevron
}: NameBoxProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	return (
		<View style={styles.wrapper}>
			{children}
			<View style={styles.container}>
				<Text style={styles.title} numberOfLines={1}>
					{title}
				</Text>

				<Text style={styles.subtitle} numberOfLines={2} allowFontScaling={true}>
					{subTitle1}
				</Text>

				{subTitle2 !== '' && (
					<Text style={styles.subtitle} numberOfLines={2}>
						{subTitle2}
					</Text>
				)}
			</View>
			{showChevron && (
				<View style={styles.chevronContainer}>
					<PlatformIcon
						ios={{ name: 'chevron.forward', size: 16 }}
						android={{ name: 'chevron_right', size: 26 }}
						web={{ name: 'ChevronRight', size: 26 }}
						style={styles.chevronIcon}
					/>
				</View>
			)}
		</View>
	)
}

export default NameBox

const stylesheet = createStyleSheet((theme) => ({
	wrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 15,
		width: '100%'
	},
	container: {
		alignItems: 'flex-start',
		flex: 1,
		justifyContent: 'center',
		marginLeft: 16,
		maxWidth: '92%'
	},
	subtitle: {
		color: theme.colors.text,
		fontSize: 12,
		lineHeight: 14,
		overflow: 'hidden'
	},
	title: {
		color: theme.colors.text,
		fontSize: 18,
		fontWeight: 'bold',
		overflow: 'hidden'
	},
	chevronContainer: {
		marginLeft: 8,
		alignItems: 'center',
		justifyContent: 'center'
	},
	chevronIcon: {
		color: theme.colors.labelSecondaryColor
	}
}))
