import type React from 'react';

import ErrorView from '../Error/ErrorView';

export default function MapScreen(): React.JSX.Element {
	return (
		<ErrorView
			title="Map not available"
			message="The map is not available on the web platform yet. Download the mobile app to get started."
			isCritical={false}
		/>
	);
}
