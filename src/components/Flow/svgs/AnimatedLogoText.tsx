import type React from 'react'
import ContentLoader from 'react-content-loader/native'
import { Platform } from 'react-native'
import { G, Path, Rect, Svg } from 'react-native-svg'
import { useStyles } from 'react-native-unistyles'

const LogoContent = () => (
	<G className="cls-1">
		<G id="Ebene_2" data-name="Ebene 2">
			<G id="Aufteilung">
				<G id="Wortmarke_klein" data-name="Wortmarke klein">
					<Path d="M2.91,13.41H0V2.87C0,1.15,1.23,0,3.82,0A3.88,3.88,0,0,1,7.87,2.44l4.86,8.41a1.17,1.17,0,0,0,1.06.55c.62,0,1-.3,1-.75V.23h2.94V10.75c0,1.74-1.26,2.89-3.83,2.89A3.9,3.9,0,0,1,9.82,11.2L5,2.79a1.05,1.05,0,0,0-1-.57c-.66,0-1,.3-1,.77Z" />
					<Path d="M21.88,11.11v2.3H35.67v-2.3ZM35.63.23H21.88V2.54H35.63Zm-.21,5.53H21.88V7.84H35.42Z" />
					<Path d="M42.9.23V9c0,1.31.84,2.07,2.77,2.07h4.21c1.87,0,2.74-.76,2.74-2.07V.23h2.86v9c0,2.77-1.85,4.2-5.4,4.2H45.32c-3.55,0-5.38-1.43-5.38-4.2v-9Z" />
					<Path d="M62.12.23V8.84c0,1.27.79,2.26,3.4,2.26H72v2.31H65.35c-4.42,0-6.15-1.92-6.15-4.55V.23Z" />
					<Path d="M77.63,13.41H74.42L80.27,1.7C80.89.47,82,0,83.77,0s2.87.47,3.46,1.7l5.63,11.71H89.62L84.56,2.81a.8.8,0,0,0-.81-.45.86.86,0,0,0-.84.45Z" />
					<Path d="M98.83,13.41H95.92V2.87C95.92,1.15,97.16,0,99.75,0a3.86,3.86,0,0,1,4,2.44l4.87,8.41a1.15,1.15,0,0,0,1.06.55c.61,0,1-.3,1-.75V.23h2.94V10.75c0,1.74-1.26,2.89-3.83,2.89a3.91,3.91,0,0,1-4.07-2.44l-4.86-8.41a1,1,0,0,0-1-.57c-.67,0-1,.3-1,.77Z" />
					<Path d="M127.39.23H119c-.94,0-1.38.36-1.38,1.08V8.37h2.91V2.77c0-.18.1-.23.32-.23h6.52c3.23,0,4.59,1.26,4.59,4.27s-1.36,4.3-4.59,4.3h-9.75v1.22c0,.73.44,1.08,1.38,1.08h8.37c4.89,0,7.51-2.15,7.51-6.58S132.26.23,127.39.23Z" />
					<Rect x={137.71} y={11.11} width={13.79} height={2.3} />
				</G>
			</G>
		</G>
	</G>
)

const AnimatedLogoText = ({
	dimensions,
	speed
}: {
	dimensions: { logoWidth: number; logoHeight: number }
	speed: number
}): React.JSX.Element => {
	const { theme } = useStyles()

	if (Platform.OS === 'web') {
		return (
			<Svg
				width={dimensions.logoWidth}
				height={dimensions.logoHeight}
				viewBox="0 0 151.5 15"
				fill={theme.colors.labelColor}
				transform={'scale(1.05)'}
			>
				<LogoContent />
			</Svg>
		)
	}

	return (
		<ContentLoader
			width={dimensions.logoWidth}
			height={dimensions.logoHeight}
			backgroundColor={theme.colors.labelColor}
			foregroundColor={theme.colors.text}
			speed={speed}
			viewBox="0 0 151.5 15"
			transform={'scale(1.05)'}
		>
			<LogoContent />
		</ContentLoader>
	)
}

export default AnimatedLogoText
