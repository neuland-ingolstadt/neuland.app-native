import { useFocusEffect } from 'expo-router';
import * as React from 'react';

/**
 * Hook that refreshes data when the screen is focused.
 * @param refetch Callback function to be called when data should be refreshed
 */
export function useRefreshOnFocus(refetch: () => void): void {
	const enabledRef = React.useRef(false);

	useFocusEffect(
		React.useCallback(() => {
			if (enabledRef.current) {
				refetch();
			} else {
				enabledRef.current = true;
			}
		}, [refetch])
	);
}
