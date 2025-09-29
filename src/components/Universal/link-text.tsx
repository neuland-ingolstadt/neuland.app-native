import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Linking,
	type StyleProp,
	StyleSheet,
	Text,
	type TextStyle,
	View,
	type ViewStyle
} from 'react-native'

const URL_REGEX = /(https?:\/\/[^\s]+)/g

export interface LinkTextProps {
	text: string
	linkColor: string
	collapsedLines?: number
	textStyle?: StyleProp<TextStyle>
	toggleStyle?: StyleProp<TextStyle>
	containerStyle?: StyleProp<ViewStyle>
}

const DEFAULT_COLLAPSED_LINES = 6

const LinkText: React.FC<LinkTextProps> = ({
	text,
	linkColor,
	collapsedLines = DEFAULT_COLLAPSED_LINES,
	textStyle,
	toggleStyle,
	containerStyle
}) => {
	const { t } = useTranslation('common')
	const [lineCount, setLineCount] = useState<number | null>(null)
	const [expanded, setExpanded] = useState(false)

	const parts = useMemo(() => text.split(URL_REGEX), [text])

	const shouldClamp =
		lineCount != null && lineCount > collapsedLines && expanded === false
	const shouldShowToggle = lineCount != null && lineCount > collapsedLines

	return (
		<View style={[styles.container, containerStyle]}>
			<Text
				style={[styles.text, textStyle]}
				onTextLayout={(event) => {
					if (lineCount == null) {
						const totalLines = event.nativeEvent.lines?.length ?? 0
						setLineCount(totalLines)
					}
				}}
				numberOfLines={shouldClamp ? collapsedLines : undefined}
			>
				{parts.map((part, index) => {
					if (part.match(URL_REGEX)) {
						return (
							<Text
								key={index}
								onPress={() => {
									void Linking.openURL(part)
								}}
								style={{ color: linkColor }}
							>
								{part}
							</Text>
						)
					}
					return part
				})}
			</Text>
			{shouldShowToggle && (
				<Text
					style={[styles.toggle, toggleStyle]}
					onPress={() => {
						setExpanded((prev) => !prev)
					}}
				>
					{expanded ? t('showLess') : t('showMore')}
				</Text>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		gap: 8
	},
	text: {},
	toggle: {
		fontSize: 14,
		fontWeight: '600'
	}
})

export default LinkText
