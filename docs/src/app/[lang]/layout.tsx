import type { Metadata } from 'next'
import { Banner, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { LastUpdated, Layout, Navbar } from 'nextra-theme-docs'
import 'nextra-theme-docs/style.css'

import type { FC, ReactNode } from 'react'
import { Footer } from '@/components/footer'
import NeulandLogo from '@/components/icons/logo'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { getDictionary } from '../_dictionaries/get-dictionary'
import './global.css'

export async function generateMetadata({
	params
}: {
	params: Promise<{ lang: string }>
}): Promise<Metadata> {
	const resolvedParams = await params
	const dictionary = await getDictionary(resolvedParams.lang)

	return {
		title: {
			default: dictionary.metadata.title,
			template: `%s | ${dictionary.metadata.title}`
		},
		description: dictionary.metadata.description,
		keywords: ['neuland', 'campus', 'university', 'app', 'ingolstadt', 'thi'],
		authors: [{ name: 'Neuland Ingolstadt e.V.' }],
		creator: 'Neuland Ingolstadt e.V.',
		publisher: 'Neuland Ingolstadt e.V.',
		metadataBase: new URL('https://neuland.app'),
		openGraph: {
			type: 'website',
			locale: resolvedParams.lang,
			alternateLocale: resolvedParams.lang === 'en' ? 'de' : 'en',
			title: dictionary.metadata.title,
			description: dictionary.metadata.description,
			siteName: dictionary.metadata.title
		},
		twitter: {
			title: dictionary.metadata.title,
			description: dictionary.metadata.description
		},
		icons: [
			{
				rel: 'apple-touch-icon',
				url: '/apple-touch-icon.png'
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '32x32',
				url: '/favicon-32x32.png'
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '16x16',
				url: '/favicon-16x16.png'
			},
			{
				rel: 'icon',
				url: '/favicon.ico'
			}
		]
	}
}

const banner = (
	<Banner storageKey="release-0.13">
		<a
			href="https://neuland-ingolstadt.de/blog/neuland-next-0-13"
			target="_blank"
			rel="noopener"
		>
			Neuland Next 0.13 ist verfügbar 🎉
		</a>
	</Banner>
)
type LayoutProps = Readonly<{
	children: ReactNode
	params: Promise<{
		lang: string
	}>
}>

const RootLayout: FC<LayoutProps> = async ({ children, params }) => {
	const resolvedParams = await params
	const { lang } = resolvedParams
	const dictionary = await getDictionary(lang)
	const pageMap = await getPageMap(`/${lang}`)

	return (
		<html lang="de" dir="ltr" suppressHydrationWarning>
			<body>
				<ThemeProvider>
					<a
						href="#main-content"
						className="fixed left-0 top-0 z-50 -translate-y-full bg-primary px-4 py-2 text-primary-foreground transition-transform focus:translate-y-0"
					>
						{dictionary.skipToContent}
					</a>
					<Layout
						sidebar={{
							autoCollapse: false,
							defaultMenuCollapseLevel: 1,
							toggleButton: true
						}}
						banner={banner}
						navbar={
							<Navbar
								logo={
									<div className="flex items-center gap-2">
										<NeulandLogo
											className="h-6 w-6 rounded-lg object-contain"
											color="currentColor"
										/>
										<span className="text-lg font-bold text-foreground">
											Neuland Next
										</span>
									</div>
								}
								className="backdrop-blur-md bg-background/60"
							>
								<div className="flex items-center gap-2">
									<ThemeToggle />
									<LocaleSwitcher />
								</div>
							</Navbar>
						}
						search={
							<Search
								placeholder={dictionary.search.placeholder}
								emptyResult={dictionary.search.emptyResult}
								errorText={dictionary.search.errorText}
								loading={dictionary.search.loading}
							/>
						}
						pageMap={pageMap}
						docsRepositoryBase="https://github.com/neuland-ingolstadt/neuland.app-native/docs"
						feedback={{
							content: 'Feedback'
						}}
						lastUpdated={<LastUpdated> {dictionary.lastUpdated}</LastUpdated>}
						editLink={dictionary.editPage}
						footer={<Footer />}
					>
						{children}
					</Layout>
				</ThemeProvider>
			</body>
		</html>
	)
}

export default RootLayout
