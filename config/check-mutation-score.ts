const REPORT_PATH = 'reports/mutation/mutation-report.json'
// Baseline with paired test files only (see stryker.conf.mjs bun.testFiles):
// ~76% total, ~77% covered. Leave headroom for CI variance.
const MIN_COVERED_MUTATION_SCORE = 75
const MIN_TOTAL_MUTATION_SCORE = 75

interface MutantResult {
	status: 'Killed' | 'Survived' | 'NoCoverage' | 'Timeout' | 'Ignored' | 'Pending'
}

interface MutationReport {
	files: Record<string, { mutants: MutantResult[] }>
}

const report = (await Bun.file(REPORT_PATH).json()) as MutationReport

const counts = { killed: 0, survived: 0, noCoverage: 0, timeout: 0, other: 0 }

for (const file of Object.values(report.files)) {
	for (const mutant of file.mutants) {
		switch (mutant.status) {
			case 'Killed':
				counts.killed++
				break
			case 'Survived':
				counts.survived++
				break
			case 'NoCoverage':
				counts.noCoverage++
				break
			case 'Timeout':
				counts.timeout++
				break
			default:
				counts.other++
		}
	}
}

const detected = counts.killed + counts.timeout
const covered = detected + counts.survived
const total = covered + counts.noCoverage + counts.other

const totalScore = total > 0 ? (detected / total) * 100 : 0
const coveredScore = covered > 0 ? (detected / covered) * 100 : 0

const format = (value: number) => value.toFixed(2)

console.log(
	`Mutation score: total ${format(totalScore)}% (${detected}/${total}), covered ${format(coveredScore)}% (${detected}/${covered})`
)

let failed = false

if (coveredScore < MIN_COVERED_MUTATION_SCORE) {
	console.error(
		`error: covered mutation score ${format(coveredScore)}% is below minimum ${MIN_COVERED_MUTATION_SCORE}%`
	)
	failed = true
}

if (totalScore < MIN_TOTAL_MUTATION_SCORE) {
	console.error(
		`error: total mutation score ${format(totalScore)}% is below minimum ${MIN_TOTAL_MUTATION_SCORE}%`
	)
	failed = true
}

if (failed) {
	process.exit(1)
}
