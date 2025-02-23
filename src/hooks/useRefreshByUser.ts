import * as React from 'react';

interface RefreshOnFocus {
	isRefetchingByUser: boolean;
	refetchByUser: () => Promise<void>;
}

/**
 * Hook to refresh data by user
 * @param refetch Callback function to be called when data should be refreshed
 */
export function useRefreshByUser(
	refetch: () => Promise<unknown>
): RefreshOnFocus {
	const [isRefetchingByUser, setIsRefetchingByUser] = React.useState(false);

	async function refetchByUser(): Promise<void> {
		setIsRefetchingByUser(true);

		try {
			await refetch();
		} finally {
			setIsRefetchingByUser(false);
		}
	}

	return {
		isRefetchingByUser,
		refetchByUser
	};
}
