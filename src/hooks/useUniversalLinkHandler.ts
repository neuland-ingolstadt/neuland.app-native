import {
	type Href,
	router,
	usePathname,
	useRootNavigationState
} from 'expo-router'
import { useEffect, useRef } from 'react'
import { Linking } from 'react-native'
import {
	normalizeRoutePath,
	parseUniversalLinkPath
} from '@/utils/universal-link'

function navigateToUniversalLinkPath(path: string, currentPath: string): void {
	const targetPath = normalizeRoutePath(path)
	const normalizedCurrentPath = normalizeRoutePath(currentPath)

	if (targetPath === normalizedCurrentPath) {
		return
	}

	router.navigate(`/${targetPath}` as Href)
}

export function useUniversalLinkHandler(): void {
	const rootNavigationState = useRootNavigationState()
	const pathname = usePathname()
	const pathnameRef = useRef(pathname)
	pathnameRef.current = pathname
	const navigationReady = rootNavigationState?.key != null

	useEffect(() => {
		if (!navigationReady) {
			return
		}

		const handleOpenURL = (url: string): void => {
			const path = parseUniversalLinkPath(url)
			if (!path) {
				return
			}

			navigateToUniversalLinkPath(path, pathnameRef.current)
		}

		let cancelled = false
		void Linking.getInitialURL().then((url) => {
			if (cancelled || !url) {
				return
			}

			handleOpenURL(url)
		})

		const linkingSubscription = Linking.addEventListener('url', (event) => {
			handleOpenURL(event.url)
		})

		return () => {
			cancelled = true
			linkingSubscription.remove()
		}
	}, [navigationReady])
}
