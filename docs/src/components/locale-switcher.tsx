'use client'

import { Check, Languages } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const locales = [
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'de', name: 'Deutsch', flag: '🇩🇪' }
]

export function LocaleSwitcher() {
	const pathname = usePathname()
	const currentLocale = pathname.split('/')[1]

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-9 w-9 relative group">
					<Languages className="h-4 w-4 transition-transform" />
					<span className="sr-only">Switch language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<p className="text-sm font-medium leading-none">Language</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{locales.map((locale) => (
					<DropdownMenuItem
						key={locale.code}
						onClick={() => {
							const newPath = pathname.replace(
								`/${currentLocale}`,
								`/${locale.code}`
							)
							window.location.href = newPath
						}}
						className={cn(
							'flex items-center justify-between',
							currentLocale === locale.code && 'bg-accent'
						)}
					>
						<div className="flex items-center gap-2">
							<span className="text-lg">{locale.flag}</span>
							<span>{locale.name}</span>
						</div>
						{currentLocale === locale.code && (
							<Check className="h-4 w-4 text-primary" />
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
