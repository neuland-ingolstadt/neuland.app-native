import type { Lecturers } from '@/types/thi-api'
import type { NormalizedLecturer } from '@/types/utils'

export interface LecturerLink {
	name: string
	lecturer?: NormalizedLecturer
}

export function parseLecturerIds(
	lvId: string | number | null | undefined
): string[] {
	if (lvId == null) return []
	const normalized = String(lvId).trim()
	if (normalized === '') return []
	return normalized
		.split(/,\s*/)
		.map((id) => id.trim())
		.filter(Boolean)
}

function findLecturerById(
	id: string,
	...sources: NormalizedLecturer[][]
): NormalizedLecturer | undefined {
	for (const lecturers of sources) {
		const match = lecturers.find((lecturer) => lecturer.id === id)
		if (match != null) return match
	}
	return undefined
}

function parseTimetableLecturerLabel(label: string): {
	lastName: string
	firstInitial?: string
} {
	const trimmed = label.trim()
	const match = trimmed.match(/^(.+?),\s*([A-Za-zÄÖÜäöüß])\.$/)
	if (match != null) {
		return {
			lastName: match[1].trim(),
			firstInitial: match[2]
		}
	}
	return { lastName: trimmed }
}

function findLecturerByTimetableLabel(
	label: string,
	...sources: NormalizedLecturer[][]
): NormalizedLecturer | undefined {
	const { lastName, firstInitial } = parseTimetableLecturerLabel(label)

	for (const lecturers of sources) {
		const sameLastName = lecturers.filter(
			(lecturer) =>
				lecturer.name.localeCompare(lastName, 'de', { sensitivity: 'base' }) ===
				0
		)

		if (sameLastName.length === 0) continue

		if (firstInitial != null) {
			const withMatchingInitial = sameLastName.filter((lecturer) => {
				const vorname = lecturer.vorname?.trim()
				return (
					vorname != null &&
					vorname.length > 0 &&
					vorname.charAt(0).toLocaleUpperCase('de') ===
						firstInitial.toLocaleUpperCase('de')
				)
			})
			if (withMatchingInitial.length === 1) return withMatchingInitial[0]
		}

		if (sameLastName.length === 1) return sameLastName[0]
	}

	return undefined
}

function findLecturerForTimetableEntry(
	entry: { name: string; id?: string },
	...sources: NormalizedLecturer[][]
): NormalizedLecturer | undefined {
	if (entry.id != null) {
		const byId = findLecturerById(entry.id, ...sources)
		if (byId != null) return byId
	}
	return findLecturerByTimetableLabel(entry.name, ...sources)
}

function pairLecturerNamesAndIds(
	lecturerNames: string,
	lecturerIds: string[]
): { name: string; id?: string }[] {
	const trimmedName = lecturerNames.trim()
	if (trimmedName === '') return []

	if (lecturerIds.length <= 1) {
		return [{ name: trimmedName, id: lecturerIds[0] }]
	}

	const names = trimmedName
		.split(/,\s*/)
		.map((name) => name.trim())
		.filter(Boolean)
	return names.map((name, index) => ({
		name,
		id: lecturerIds[index]
	}))
}

export function resolveLecturerLinks(
	lecturerNames: string,
	lecturerIds: string[],
	...sources: NormalizedLecturer[][]
): LecturerLink[] {
	return pairLecturerNamesAndIds(lecturerNames, lecturerIds).map((entry) => ({
		name: entry.name,
		lecturer: findLecturerForTimetableEntry(entry, ...sources)
	}))
}

/**
 * Normalizes lecturer data.
 * This removes invalid entries and converts phone numbers to a standardized format.
 * @param {object[]} entries
 * @returns {object[]}
 */
export function normalizeLecturers(entries: Lecturers[]): NormalizedLecturer[] {
	return entries
		.filter((x) => !(x.vorname == null)) // remove dummy entries
		.map((x) => ({
			...x,
			// try to reformat phone numbers to DIN 5008 International
			tel_dienst: x.tel_dienst
				.trim()
				.replace(/\(0\)/g, '') // remove (0) in +49 (0) 8441
				.replace(/(\d|\/|^)(\s|-|\/|\(|\))+(?=\d|\/)/g, '$1') // remove spaces, -, / and braces in numbers
				.replace(/^-?(\d{3,5})$/, '+49 841 9348$1') // add prefix for suffix-only numbers
				.replace(/^9348/, '+49 841 9348') // add missing +49 841 prefix to THI numbers
				.replace(/^49/, '+49') // fix international format
				.replace(/^((\+?\s*49)|0)\s*841\s*/, '+49 841 '),
			room_short: ((x.raum ?? '').match(/[A-Z]\s*\d+/g) ?? [''])[0].replace(
				/\s+/g,
				''
			)
		}))
		.sort((a, b) => a.name.localeCompare(b.name))
}
