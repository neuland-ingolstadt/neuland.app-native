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

export function useUniversalLinkHandler(isAppReady: boolean): void {
	const rootNavigationState = useRootNavigationState()
	const pathname = usePathname()
	const initialUrlHandledRef = useRef(false)
	const navigationReady = rootNavigationState?.key != null

	useEffect(() => {
		if (!isAppReady || !navigationReady) {
			return
		}

		const handleOpenURL = (url: string): void => {
			const path = parseUniversalLinkPath(url)
			if (!path) {
				return
			}

			navigateToUniversalLinkPath(path, pathname)
		}

		if (!initialUrlHandledRef.current) {
			initialUrlHandledRef.current = true
			void Linking.getInitialURL().then((url) => {
				if (url) {
					handleOpenURL(url)
				}
			})
		}

		const linkingSubscription = Linking.addEventListener('url', (event) => {
			handleOpenURL(event.url)
		})

		return () => {
			linkingSubscription.remove()
		}
	}, [isAppReady, navigationReady, pathname])
}
