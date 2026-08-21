const { createRunOncePlugin, withDangerousMod } = require('expo/config-plugins')
const { resolveOptions } = require('./rustrak-sourcemaps/defaults')
const { writeSentryBuildPluginFile } = require('./rustrak-sourcemaps/env')

const PLUGIN_NAME = 'with-rustrak-sourcemaps'
const PLUGIN_VERSION = '1.3.0'

/**
 * Writes `.env.sentry-build-plugin` so the official `@sentry/react-native/expo`
 * Xcode / Gradle upload targets RustRak. JS maps are uploaded by sentry-cli.
 *
 * @param {import('@expo/config-types').ExpoConfig} config
 * @param {Partial<import('./rustrak-sourcemaps/defaults').RustrakSourcemapsOptions> | undefined} props
 */
function withRustrakSourcemaps(config, props) {
	const options = resolveOptions(props)

	config._internal = config._internal ?? {}
	config._internal.rustrakSourcemaps = options

	return withDangerousMod(config, [
		'ios',
		(modConfig) => {
			writeSentryBuildPluginFile(modConfig.modRequest.projectRoot, {
				loadLocalEnv: true,
				options
			})
			return modConfig
		}
	])
}

module.exports = createRunOncePlugin(
	withRustrakSourcemaps,
	PLUGIN_NAME,
	PLUGIN_VERSION
)
