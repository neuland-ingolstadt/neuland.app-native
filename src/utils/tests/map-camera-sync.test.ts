import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	mock
} from 'bun:test'
import { Window as HappyDomWindow } from 'happy-dom'
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { type ClickedMapElement, SEARCH_TYPES } from '@/types/map'
import { INGOLSTADT_CENTER, NEUBURG_CENTER } from '@/utils/map-constants'

mock.module('@aptabase/react-native', () => ({ trackEvent: () => {} }))
mock.module('burnt', () => ({ toast: () => {} }))
mock.module('expo-clipboard', () => ({ setStringAsync: async () => {} }))

let cameraSync: typeof import('@/hooks/useMapCanvasState')
let LoadingState: typeof import('@/utils/ui-utils')['LoadingState']
type CameraSyncOptions = Parameters<typeof cameraSync.useMapCameraSync>[0]

const actEnvironment = globalThis as typeof globalThis & {
	IS_REACT_ACT_ENVIRONMENT?: boolean
}
let previousActEnvironment: boolean | undefined

interface CameraHarnessProps {
	options: CameraSyncOptions
}

function CameraHarness({
	options
}: CameraHarnessProps): React.JSX.Element | null {
	cameraSync.useMapCameraSync(options)
	return null
}

const neuburgBuilding: ClickedMapElement = {
	type: SEARCH_TYPES.BUILDING,
	data: 'CN',
	center: NEUBURG_CENTER
}

let happyDomWindow: HappyDomWindow
let root: Root
let options: CameraSyncOptions

function renderCamera(next: Partial<CameraSyncOptions> = {}): void {
	options = { ...options, ...next }
	act(() => {
		root.render(React.createElement(CameraHarness, { options }))
	})
}

beforeAll(async () => {
	previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT
	actEnvironment.IS_REACT_ACT_ENVIRONMENT = true
	happyDomWindow = new HappyDomWindow()
	globalThis.document = happyDomWindow.document as unknown as Document
	globalThis.window = happyDomWindow as unknown as Window &
		typeof globalThis.window
	cameraSync = await import('@/hooks/useMapCanvasState')
	LoadingState = (await import('@/utils/ui-utils')).LoadingState
})

beforeEach(() => {
	root = createRoot(document.createElement('div'))
	options = {
		mapLoadState: LoadingState.LOADED,
		cameraResetRequestId: 0,
		mapCenter: INGOLSTADT_CENTER,
		clickedElement: null,
		focusPaddingBottom: 0,
		flyTo: mock(() => {})
	}
})

afterEach(() => {
	act(() => root.unmount())
})

afterAll(() => {
	actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
	happyDomWindow.close()
	delete (globalThis as { document?: Document }).document
	delete (globalThis as { window?: Window }).window
})

describe('map camera synchronization', () => {
	it('preserves the camera when changing floors clears a Neuburg selection', () => {
		renderCamera({ clickedElement: neuburgBuilding, focusPaddingBottom: 300 })
		expect(options.flyTo).toHaveBeenCalledWith(neuburgBuilding, 300)

		renderCamera({ clickedElement: null, focusPaddingBottom: 0 })
		renderCamera()
		expect(options.flyTo).toHaveBeenCalledTimes(1)
	})

	it('leaves an unselected map free to pan between layer updates', () => {
		renderCamera()
		renderCamera()
		expect(options.flyTo).not.toHaveBeenCalled()
	})

	it('focuses a selection once the map has loaded', () => {
		renderCamera({
			mapLoadState: LoadingState.LOADING,
			clickedElement: neuburgBuilding,
			focusPaddingBottom: 300
		})
		expect(options.flyTo).not.toHaveBeenCalled()

		renderCamera({ mapLoadState: LoadingState.LOADED })
		expect(options.flyTo).toHaveBeenCalledWith(neuburgBuilding, 300)
	})

	it('still resets the camera on an explicit reset request', () => {
		renderCamera({ clickedElement: neuburgBuilding, focusPaddingBottom: 300 })
		renderCamera({
			clickedElement: null,
			focusPaddingBottom: 0,
			cameraResetRequestId: 1
		})
		expect(options.flyTo).toHaveBeenLastCalledWith(null, 0)
		expect(options.flyTo).toHaveBeenCalledTimes(2)

		renderCamera({ clickedElement: neuburgBuilding, focusPaddingBottom: 300 })
		renderCamera({ clickedElement: null, focusPaddingBottom: 0 })
		expect(options.flyTo).toHaveBeenCalledTimes(3)
	})
})
