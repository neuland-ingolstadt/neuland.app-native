import type React from 'react'
import { IndoorNavHud } from '@/components/Map/indoor-nav-hud'
import type { MapIndoorNavMode } from '@/hooks/useMapIndoorNav'

interface MapIndoorNavOverlayProps {
	navMode: MapIndoorNavMode | null
}

export function MapIndoorNavOverlay({
	navMode
}: MapIndoorNavOverlayProps): React.JSX.Element | null {
	if (navMode == null) {
		return null
	}

	return (
		<IndoorNavHud
			kicker={navMode.copy.kicker}
			headline={navMode.copy.headline}
			subline={navMode.copy.subline}
			floorBadge={navMode.floorBadge}
			meta={navMode.copy.meta}
			arrived={navMode.copy.arrived}
			nextLabel={navMode.copy.next?.label}
			nextHint={navMode.copy.next?.hint}
			nextDir={navMode.copy.next?.dir}
			canGoBack={navMode.stepIndex > 0}
			backLabel={navMode.backLabel}
			endLabel={navMode.endLabel}
			onBack={() => {
				navMode.selectStep(navMode.stepIndex - 1)
			}}
			onNext={() => {
				navMode.selectStep(navMode.stepIndex + 1)
			}}
			onCancel={navMode.cancel}
		/>
	)
}
