import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// List of all supported locales
const locales = ['en', 'de']

// Get the preferred locale from the request headers
function getLocale(request: NextRequest) {
	const acceptLanguage = request.headers.get('accept-language')
	if (acceptLanguage) {
		const preferredLocale = acceptLanguage
			.split(',')
			.map((lang) => lang.split(';')[0].trim())
			.find((lang) => locales.includes(lang))
		if (preferredLocale) return preferredLocale
	}
	return 'en' // Default to English
}

export function middleware(request: NextRequest) {
	// Check if there is any supported locale in the pathname
	const pathname = request.nextUrl.pathname
	const pathnameIsMissingLocale = locales.every(
		(locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
	)

	// Skip locale redirection for static assets and images
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname.startsWith('/assets') ||
		pathname.includes('.') // This will catch files with extensions like .ico, .png, etc.
	) {
		return NextResponse.next()
	}

	// Redirect if there is no locale
	if (pathnameIsMissingLocale) {
		const locale = getLocale(request)
		return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
	}
}

export const config = {
	matcher: [
		// Skip all internal paths (_next), api, assets, and other static files
		'/((?!_next|api|assets|favicon.ico).*)'
	]
}
