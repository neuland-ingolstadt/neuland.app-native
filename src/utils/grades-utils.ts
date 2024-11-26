import API from '@/api/authenticated-api'
import { type SpoWeights } from '@/types/asset-api'
import { type Grade } from '@/types/thi-api'
import { type GradeAverage } from '@/types/utils'

function simplifyName(x: string): string {
    return x.replace(/\W|und|u\./g, '').toLowerCase()
}

/**
 * Fetches and parses the grade list
 * @returns {Grade[]}
 */
async function getGradeList(): Promise<Grade[]> {
    const gradeList = await API.getGrades()

    gradeList.forEach((x) => {
        if (x.anrech === '*' && x.note === '') {
            x.note = 'E*'
        }
        if (
            x.note === '' &&
            gradeList?.some((y) => x.pon === y.pon && y.note !== '')
        ) {
            x.note = 'E'
        }
    })

    return gradeList
}

/**
 * Fetches, parses and filters the grade list
 * @returns {Promise<{ finished: Grade[], missing: Grade[] }>}
 */
export async function loadGrades(): Promise<{
    finished: Grade[]
    missing: Grade[]
}> {
    const gradeList = await getGradeList()

    const duplicateGrades = gradeList.filter((x, i) =>
        gradeList.some((y, j) => i !== j && x.titel.trim() === y.titel.trim())
    )

    // group by title and keep the one with the highest ECTS
    const groupedDuplicates = duplicateGrades.reduce<Grade[]>((acc, curr) => {
        const existing = acc.find((x) => x.titel.trim() === curr.titel.trim())
        if (existing != null) {
            if (existing.ects < curr.ects) {
                existing.ects = curr.ects
            }
        } else {
            acc.push(curr)
        }
        return acc
    }, [])

    const deduplicatedGrades = gradeList
        .filter(
            (x) =>
                !groupedDuplicates.some(
                    (y) => x.titel.trim() === y.titel.trim()
                )
        )
        .concat(groupedDuplicates)

    // sort by original index
    const sortedGrades = deduplicatedGrades.sort(
        (a, b) => gradeList.indexOf(a) - gradeList.indexOf(b)
    )

    const finishedGrades = sortedGrades.filter((x) => x.note)
    const missingGrades = sortedGrades.filter(
        (x) => !finishedGrades.some((y) => x.titel.trim() === y.titel.trim())
    )

    return {
        finished: finishedGrades,
        missing: missingGrades,
    }
}

/**
 * This Function is to calculate the number of ETCS a User has.
 * @returns {Promise<number>}
 */
export async function calculateECTS(): Promise<number> {
    const { finished } = await loadGrades()

    let j = 0
    for (let i = finished.length - 1; i >= 0; i--) {
        j = j + parseInt(finished[i].ects)
    }

    return j
}

/**
 * Calculates the approximate grade average based on automatically extracted SPO data
 * @returns {Promise<GradeAverage>} - grade average data object
 * @throws {Error} - if the grade average is not available
 */
export async function loadGradeAverage(
    courseSPOs: SpoWeights | null = null,
    spoName: string | null = null
): Promise<GradeAverage> {
    const gradeList = await getGradeList()

    if (spoName == null || courseSPOs?.[spoName] == null) {
        throw new Error('Failed to load data')
    }

    const average: GradeAverage = {
        result: -1,
        missingWeight: 0,
        entries: [],
        resultMin: -1,
        resultMax: -1,
    }

    gradeList.forEach((x) => {
        const grade =
            x.note.length > 0 ? parseFloat(x.note.replace(',', '.')) : null
        if (grade != null) {
            const spo = courseSPOs[spoName]
            const name = simplifyName(x.titel)
            const spoEntries = spo.filter((y) => simplifyName(y.name) === name)
            const entry =
                spoEntries.find(
                    (y) => typeof y.weight === 'number' && y.weight !== 0
                ) ?? spoEntries[0]
            const other = average.entries.find((y) => y.simpleName === name)

            if (other != null) {
                other.grade = other.grade ?? grade
            } else if (entry != null) {
                average.entries.push({
                    simpleName: name,
                    name: entry.name,
                    weight:
                        typeof entry.weight === 'number' ? entry.weight : null,
                    grade,
                })

                if (typeof entry.weight !== 'number') {
                    average.missingWeight++
                }
            } else {
                average.entries.push({
                    simpleName: name,
                    name: x.titel,
                    weight: null,
                    grade,
                })
                average.missingWeight++
            }
        }
    })

    average.entries.sort(
        (a, b) => (b.grade != null ? 1 : 0) - (a.grade != null ? 1 : 0)
    )

    const relevantEntries = average.entries.filter(
        (curr) => curr.grade != null && curr.grade < 5
    )
    function calculateAverage(defaultWeight: number): number {
        const result = relevantEntries.reduce(
            (acc, curr) =>
                acc + (curr.weight ?? defaultWeight) * (curr.grade ?? 0),
            0
        )
        const weight = relevantEntries.reduce(
            (acc, curr) => acc + (curr.weight ?? defaultWeight),
            0
        )

        // Check if weight is 0 to avoid division by zero
        if (weight === 0) {
            throw new Error('Failed to calculate average')
        }

        return Math.floor((result / weight) * 10) / 10
    }
    average.result = calculateAverage(1)
    const avgP5 = calculateAverage(0.5)
    const avg4 = calculateAverage(4)
    average.resultMin = Math.min(avgP5, avg4)
    average.resultMax = Math.max(avgP5, avg4)
    return average
}
