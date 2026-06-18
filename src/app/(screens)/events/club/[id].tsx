import { Redirect, useLocalSearchParams } from 'expo-router'
import type React from 'react'

/** @deprecated Use `/events/organiser/[id]` — kept for deep-link backward compatibility. */
export default function ClubOrganiserRedirect(): React.JSX.Element {
	const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>()
	const id = Array.isArray(rawId) ? rawId[0] : rawId

	if (id == null || id.trim() === '') {
		return <Redirect href="/cl-events" />
	}

	return (
		<Redirect
			href={{
				pathname: '/events/organiser/[id]',
				params: { id }
			}}
		/>
	)
}
