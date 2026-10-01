export const MEMBER_ID_VISIBLE_GROUP_SLUGS = [
	'vorstand',
	'design-marketing',
	'events',
	'management',
	'hr',
	'engineering'
] as const

export function memberGroupSlug(group: string): string {
	const trimmed = group.trim()
	const lastSegment = trimmed.split('/').at(-1) ?? trimmed
	return lastSegment.toLowerCase()
}

/** Groups shown on the Neuland ID card, in fixed display order. */
export function filterMemberIdGroups(groups: string[] | undefined): string[] {
	if (!groups?.length) {
		return []
	}

	const bySlug = new Map<string, string>()
	for (const group of groups) {
		const slug = memberGroupSlug(group)
		if (
			(MEMBER_ID_VISIBLE_GROUP_SLUGS as readonly string[]).includes(slug) &&
			!bySlug.has(slug)
		) {
			bySlug.set(slug, group)
		}
	}

	return MEMBER_ID_VISIBLE_GROUP_SLUGS.flatMap((slug) => {
		const group = bySlug.get(slug)
		return group ? [group] : []
	})
}
