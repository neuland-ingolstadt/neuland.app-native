const { spawnSync } = require('node:child_process')
const { existsSync, readdirSync, rmSync, statSync } = require('node:fs')
const { join } = require('node:path')
const { applySentryEnv } = require('./env')

function expoUploadCliPath() {
	return require.resolve('@sentry/expo-upload-sourcemaps/cli.js')
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walkMaps(dir) {
	/** @type {string[]} */
	const maps = []
	/** @param {string} current */
	const walk = (current) => {
		for (const entry of readdirSync(current)) {
			const path = join(current, entry)
			const info = statSync(path)
			if (info.isDirectory()) {
				walk(path)
			} else if (entry.endsWith('.map')) {
				maps.push(path)
			}
		}
	}
	walk(dir)
	return maps
}

/**
 * Upload JS sourcemaps from `expo export` / EAS Update. Native Release
 * builds upload through `@sentry/react-native` during Xcode / Gradle.
 *
 * @param {string} projectRoot
 * @param {string} dir
 * @param {{ strip?: boolean, required?: boolean, options?: import('./defaults').RustrakSourcemapsOptions }} params
 */
function uploadOta(projectRoot, dir, params = {}) {
	const { strip = false, required = false, options } = params
	applySentryEnv(projectRoot, { options })

	const failOrSkip = (message) => {
		console.warn(message)
		if (required) {
			process.exit(1)
		}
		if (strip && existsSync(dir)) {
			for (const file of walkMaps(dir)) {
				rmSync(file)
			}
			console.log(`Removed source maps from ${dir}`)
		}
		process.exit(0)
	}

	if (!existsSync(dir)) {
		failOrSkip(`Sourcemap upload skipped: ${dir} does not exist`)
	}

	if (!process.env.SENTRY_AUTH_TOKEN) {
		failOrSkip('SENTRY_AUTH_TOKEN unset, skipping sourcemap upload')
	}

	const maps = walkMaps(dir)
	if (maps.length === 0) {
		failOrSkip(`Sourcemap upload skipped: no .map files in ${dir}`)
	}

	const result = spawnSync(process.execPath, [expoUploadCliPath(), dir], {
		stdio: 'inherit',
		env: process.env
	})
	if (result.status !== 0) {
		throw new Error(
			`@sentry/expo-upload-sourcemaps failed with exit code ${result.status ?? 1}`
		)
	}

	if (strip) {
		for (const mapFile of maps) {
			rmSync(mapFile)
		}
		console.log(`Removed source maps from ${dir} after upload`)
	}
}

module.exports = { uploadOta }
