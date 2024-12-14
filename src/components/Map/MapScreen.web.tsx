import React from 'react'

import ErrorView from '../Error/ErrorView'

export function requestPermission(): void {}

export default function MapScreen(): JSX.Element {
    return (
        <ErrorView
            title="Map not available"
            message="The map is not available on the web platform yet. Download the mobile app to get started."
            isCritical={false}
        />
    )
}
