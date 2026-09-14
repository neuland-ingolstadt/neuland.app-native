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
 * Hairline (`StyleSheet.hairlineWidth`) strokes round away at fractional
 * Y offsets and get clipped when combined with `overflow-hidden` on the
 * same view — separators flicker in form sheets and look broken on static
 * pages like Profile. A 1px outer border is split from the inner clip so
 * the outline and row separators stay visible.
 */
const GroupedCard = ({
	children,
	sheet = false,
	className,
	contentClassName
}: GroupedCardProps): React.JSX.Element => {
	return (
		<View
			className={`${sheet ? 'bg-card-sheet' : 'bg-card'} ${RADIUS_CLASS} border border-border ${className ?? ''}`.trim()}
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
