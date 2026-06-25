import { useEffect } from 'react'
import { useBinding } from 'swiftui-react-native'

export function usePickerBinding(
	value: string,
	setValue: (value: string) => void
) {
	const binding = useBinding(value)

	useEffect(() => {
		binding.setValue(value)
	}, [value])

	useEffect(() => {
		if (binding.value !== value) {
			setValue(binding.value)
		}
	}, [binding.value])

	return binding
}
