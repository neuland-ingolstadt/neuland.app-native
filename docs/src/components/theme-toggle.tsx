'use client'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/lib/useTranslations'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const { t } = useTranslation()

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" className="h-9 w-9 relative group">
				<span className="sr-only">{t('theme.toggle')}</span>
			</Button>
		)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-9 w-9 relative group">
					{theme === 'light' && <Sun className="h-4 w-4 transition-all" />}
					{theme === 'dark' && <Moon className="h-4 w-4 transition-all" />}
					{theme === 'system' && <Monitor className="h-4 w-4 transition-all" />}
					<span className="sr-only">{t('theme.toggle')}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<p className="text-sm font-medium leading-none">{t('theme.title')}</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => setTheme('light')}
					className={cn(
						'flex items-center justify-between',
						theme === 'light' && 'bg-accent'
					)}
				>
					<div className="flex items-center gap-2">
						<Sun className="h-4 w-4" />
						<span>{t('theme.light')}</span>
					</div>
					{theme === 'light' && (
						<span className="h-2 w-2 rounded-full bg-primary" />
					)}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme('dark')}
					className={cn(
						'flex items-center justify-between',
						theme === 'dark' && 'bg-accent'
					)}
				>
					<div className="flex items-center gap-2">
						<Moon className="h-4 w-4" />
						<span>{t('theme.dark')}</span>
					</div>
					{theme === 'dark' && (
						<span className="h-2 w-2 rounded-full bg-primary" />
					)}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setTheme('system')}
					className={cn(
						'flex items-center justify-between',
						theme === 'system' && 'bg-accent'
					)}
				>
					<div className="flex items-center gap-2">
						<Monitor className="h-4 w-4" />
						<span>{t('theme.system')}</span>
					</div>
					{theme === 'system' && (
						<span className="h-2 w-2 rounded-full bg-primary" />
					)}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
