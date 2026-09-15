import type React from 'react'
import { View } from 'react-native'

const RADIUS_CLASS = 'ios:rounded-ios android:rounded-md web:rounded-md'

interface GroupedCardProps {
	children: React.ReactNode
	sheet?: boolean
	className?: string
	contentClassName?: string
}

/**
 * Inset grouped list/table card used by FormList and SectionView.
 *
 * Rasterize each card at the device scale before compositing it on iOS.
 * Otherwise, individual hairlines can disappear at fractional scroll offsets.
 * Keep this on the card rather than the entire scroll view to bound the bitmap size.
 */
const GroupedCard = ({
	children,
	sheet = false,
	className,
	contentClassName
}: GroupedCardProps): React.JSX.Element => {
	return (
		<View
			shouldRasterizeIOS
			className={`${sheet ? 'bg-card-sheet' : 'bg-card'} ${RADIUS_CLASS} border-hairline border-border overflow-hidden ${className ?? ''}`.trim()}
		>
			<View
				className={`${RADIUS_CLASS} overflow-hidden ${contentClassName ?? ''}`.trim()}
			>
				{children}
			</View>
		</View>
	)
}

export default GroupedCard
