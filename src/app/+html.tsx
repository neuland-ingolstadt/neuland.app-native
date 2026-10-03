import { ScrollViewStyleReset } from 'expo-router/html'
import type { PropsWithChildren } from 'react'

/**
 * Web HTML shell — includes the Smart App Banner / App Clip card meta tag.
 */
export default function Root({
	children
}: PropsWithChildren): React.JSX.Element {
	return (
		<html lang="de">
			<head>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, shrink-to-fit=no"
				/>
				<meta
					name="apple-itunes-app"
					content="app-id=1617096811, app-clip-bundle-id=de.neuland-ingolstadt.neuland-app.clip, app-clip-display=card"
				/>
				<meta property="og:image" content="https://web.neuland.app/og.png" />
				<ScrollViewStyleReset />
			</head>
			<body>{children}</body>
		</html>
	)
}
