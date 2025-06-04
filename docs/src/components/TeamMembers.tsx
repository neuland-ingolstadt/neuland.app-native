import { Github, Instagram, Linkedin } from 'lucide-react'
import Image from 'next/image'

interface TeamMember {
	avatar: string
	name: string
	title: string
	org?: string
	links: {
		icon: 'github' | 'linkedin' | 'instagram'
		link: string
	}[]
}

interface TeamMembersProps {
	members: TeamMember[]
}

const iconMap = {
	github: Github,
	linkedin: Linkedin,
	instagram: Instagram
}

export function TeamMembers({ members }: TeamMembersProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
			{members.map((member) => {
				const isManyMore = member.name.includes('many more contributors')
				return (
					<div
						key={member.name}
						className="flex flex-col items-center p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
					>
						<div className="relative w-24 h-24 mb-4">
							<Image
								src={member.avatar}
								alt={member.name}
								fill
								className="rounded-full object-cover"
							/>
						</div>
						<h3
							className={`text-xl font-semibold mb-1 ${isManyMore ? 'text-center' : ''}`}
						>
							{member.name}
						</h3>
						<p className="text-gray-600 dark:text-gray-400 text-center mb-2">
							{member.title}
						</p>
						{member.org && (
							<p className="text-gray-500 dark:text-gray-500 text-sm mb-4 text-center">
								{member.org}
							</p>
						)}
						<div className="flex gap-4 mt-2">
							{member.links.map((link) => {
								const Icon = iconMap[link.icon]
								return (
									<a
										key={link.link}
										href={link.link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
									>
										<Icon className="w-5 h-5" />
									</a>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}
