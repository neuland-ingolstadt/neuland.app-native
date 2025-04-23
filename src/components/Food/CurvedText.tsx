import type React from 'react'
import { Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'

interface CurvedTextProps {
	text: string
	radius: number
	size: number
	startAngle?: number
}

/**
 * Component for creating curved text along a circular path
 */
export const CurvedText = ({
	text,
	radius,
	size,
	startAngle = 90
}: CurvedTextProps): React.JSX.Element => {
	const characters = text.split('')
	const anglePerChar = 5
	const startAngleRad = (startAngle * Math.PI) / 180
	const { theme } = useStyles()

	return (
		<View
			style={{ width: radius * 2, height: radius * 2, position: 'absolute' }}
		>
			{characters.map((char, index) => {
				const angle =
					startAngleRad -
					((characters.length - 1) / 2 - index) *
						((anglePerChar * Math.PI) / 180)

				return (
					<View
						key={index}
						style={{
							position: 'absolute',
							left: radius + radius * Math.cos(angle) - size / 2,
							top: radius + radius * Math.sin(angle) - size / 2,
							width: size,
							height: size,
							transform: [{ rotate: `${angle + Math.PI / 2}rad` }],
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Text
							style={{
								fontSize: size * 0.7,
								color: theme.colors.text,
								fontWeight: '300',
								opacity: 0.6
							}}
						>
							{char}
						</Text>
					</View>
				)
			})}
		</View>
	)
}

export default CurvedText
