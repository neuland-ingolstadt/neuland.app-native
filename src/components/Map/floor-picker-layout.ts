export const CELL = 38
/** Slightly larger floating chrome when liquid glass is active. */
export const CELL_GLASS = 41
export const FLOATING_CHROME_RADIUS = 10
export const GAP = 5
export const CLOSE = 38
export const CLOSE_GLASS = 41
export const PICKER_TOP = CLOSE + GAP
export const PICKER_TOP_GLASS = CLOSE_GLASS + GAP
export const CONTAINER_TOP = 110 - PICKER_TOP
export const CONTAINER_TOP_GLASS = 110 - PICKER_TOP_GLASS

export const EXPAND_SPRING = { damping: 18, stiffness: 220, mass: 0.8 }
export const SNAP_SPRING = { damping: 24, stiffness: 280, mass: 0.7 }

export function floorLabel(floor: string): string {
	return floor === 'EG' ? '0' : floor
}

export function floatingChromeRadius(cell: number, glass: boolean): number {
	return glass ? cell / 2 : FLOATING_CHROME_RADIUS
}
