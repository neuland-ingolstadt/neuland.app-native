import { type ColorValue, StyleSheet } from 'react-native'

export const hairlineBorder = { borderWidth: StyleSheet.hairlineWidth }

export const toColor = (
	value: string | number | undefined
): ColorValue | undefined => {
	if (value == null) {
		return undefined
	}

	return typeof value === 'number' ? String(value) : value
}
