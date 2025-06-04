import Link from 'next/link'

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="text-center px-4">
				<h1 className="text-6xl font-bold text-primary mb-4">404</h1>
				<h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
				<p className="text-muted-foreground mb-8">
					Oops! The page you're looking for doesn't exist or has been moved.
				</p>
				<Link
					href="/"
					className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				>
					Return Home
				</Link>
			</div>
		</div>
	)
}
