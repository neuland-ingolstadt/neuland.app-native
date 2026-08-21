const { existsSync, readFileSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')
const { resolveOptions } = require('./defaults')

/**
 * @param {string} projectRoot
 */
function loadBuildPluginEnv(projectRoot) {
	const path = join(projectRoot, '.env.sentry-build-plugin')
	if (!existsSync(path)) {
		return
	}
	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) {
			continue
		}
		const eq = trimmed.indexOf('=')
		if (eq === -1) {
			continue
		}
		const key = trimmed.slice(0, eq).trim()
		const value = trimmed.slice(eq + 1).trim()
		if (process.env[key] === undefined) {
			process.env[key] = value
		}
	}
}

/**
 * Load `.env.local` key=value pairs (no dotenv dependency).
 * @param {string} projectRoot
 */
function loadDotEnvLocal(projectRoot) {
	const path = join(projectRoot, '.env.local')
	if (!existsSync(path)) {
		return
	}

	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) {
			continue
		}
		const eq = trimmed.indexOf('=')
		if (eq === -1) {
			continue
		}
		const key = trimmed.slice(0, eq).trim()
		let value = trimmed.slice(eq + 1).trim()
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1)
		}
		if (process.env[key] === undefined) {
			process.env[key] = value
		}
	}
}

/**
 * @param {string} projectRoot
 * @param {{ loadLocalEnv?: boolean, options?: import('./defaults').RustrakSourcemapsOptions }} [params]
 */
function applySentryEnv(projectRoot, params = {}) {
	const { loadLocalEnv = true, options } = params
	loadBuildPluginEnv(projectRoot)
	if (loadLocalEnv) {
		loadDotEnvLocal(projectRoot)
	}

	const resolved = resolveOptions(options)
	process.env.SENTRY_URL = resolved.url
	process.env.SENTRY_ORG = resolved.organization
	process.env.SENTRY_PROJECT = resolved.project
	delete process.env.SENTRY_DISABLE_AUTO_UPLOAD
	process.env.SENTRY_DISABLE_XCODE_DEBUG_UPLOAD = 'true'
	process.env.SENTRY_DISABLE_NATIVE_DEBUG_UPLOAD = 'true'

	return resolved
}

/**
 * @param {string} projectRoot
 * @param {{ loadLocalEnv?: boolean, options?: import('./defaults').RustrakSourcemapsOptions }} [params]
 */
function writeSentryBuildPluginFile(projectRoot, params = {}) {
	applySentryEnv(projectRoot, params)
	const token = process.env.SENTRY_AUTH_TOKEN ?? ''
	const contents = `SENTRY_AUTH_TOKEN=${token}
SENTRY_URL=${process.env.SENTRY_URL}
SENTRY_ORG=${process.env.SENTRY_ORG}
SENTRY_PROJECT=${process.env.SENTRY_PROJECT}
SENTRY_DISABLE_XCODE_DEBUG_UPLOAD=true
SENTRY_DISABLE_NATIVE_DEBUG_UPLOAD=true
`
	writeFileSync(join(projectRoot, '.env.sentry-build-plugin'), contents)
}

/**
 * @param {string} projectRoot
 * @param {{ loadLocalEnv?: boolean, options?: import('./defaults').RustrakSourcemapsOptions }} [params]
 */
function printShellExports(projectRoot, params = {}) {
	applySentryEnv(projectRoot, params)
	const keys = [
		'SENTRY_AUTH_TOKEN',
		'SENTRY_URL',
		'SENTRY_ORG',
		'SENTRY_PROJECT',
		'SENTRY_DISABLE_XCODE_DEBUG_UPLOAD',
		'SENTRY_DISABLE_NATIVE_DEBUG_UPLOAD'
	]
	for (const key of keys) {
		const value = process.env[key]
		if (value !== undefined) {
			const escaped = value.replace(/'/g, `'\\''`)
			console.log(`export ${key}='${escaped}'`)
		}
	}
}

module.exports = {
	applySentryEnv,
	loadDotEnvLocal,
	printShellExports,
	writeSentryBuildPluginFile
}
