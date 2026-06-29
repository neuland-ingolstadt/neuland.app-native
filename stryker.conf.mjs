/** @type {import('@stryker-mutator/api').PartialStrykerOptions} */
const config = {
	testRunner: 'bun',
	plugins: ['@hughescr/stryker-bun-runner'],
	coverageAnalysis: 'perTest',
	incremental: true,
	incrementalFile: '.stryker-incremental.json',
	tempDirName: '.stryker-tmp',
	reporters: ['clear-text', 'progress', 'html', 'json'],
	jsonReporter: {
		fileName: 'reports/mutation/mutation-report.json'
	},
	htmlReporter: {
		fileName: 'reports/mutation/html/index.html'
	},
	// Only utils with static top-level imports in tests. Files that use
	// mock.module() before dynamic import are incompatible with Stryker's
	// eager preload of mutated modules (see stryker-bun-runner README).
	mutate: [
		'src/utils/app-utils.ts',
		'src/utils/campus-life-utils.ts',
		'src/utils/changelog-utils.ts',
		'src/utils/lecturers-utils.ts',
		'src/utils/map-screen-utils.ts',
		'src/utils/universal-link.ts',
		'src/utils/up-next-utils.ts'
	],
	ignorePatterns: [
		'ios',
		'android',
		'src/assets',
		'src/app',
		'src/components',
		'config',
		'.github',
		'.agents',
		'patches',
		'CHANGELOG.md'
	],
	bun: {
		inspectorTimeout: 10_000,
		timeout: 30_000,
		bunArgs: ['--ci'],
		testFiles: [
			'src/utils/tests/app-utils.test.ts',
			'src/utils/tests/campus-life-utils.test.ts',
			'src/utils/tests/changelog-utils.test.ts',
			'src/utils/tests/lecturers-utils.test.ts',
			'src/utils/tests/map-screen-utils.test.ts',
			'src/utils/tests/universal-link.test.ts',
			'src/utils/tests/up-next-utils.test.ts'
		]
	},
	thresholds: {
		high: 80,
		low: 75,
		break: null
	},
	timeoutMS: 60_000,
	concurrency: 2,
	dryRunTimeoutMinutes: 5
}

export default config
