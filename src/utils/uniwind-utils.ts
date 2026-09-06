import type { ColorValue } from 'react-native'

export const toColor = (
	value: string | number | undefined
): ColorValue | undefined => {
	if (value == null) {
		return undefined
	}

	return typeof value === 'number' ? String(value) : value
}
