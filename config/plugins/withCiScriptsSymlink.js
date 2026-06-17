const { withDangerousMod } = require('expo/config-plugins')
const { existsSync, lstatSync, rmSync, symlinkSync } = require('node:fs')
const { join } = require('node:path')

function withCiScriptsSymlink(expoConfig) {
	return withDangerousMod(expoConfig, [
		'ios',
		(modConfig) => {
			if (modConfig.modRequest.platform !== 'ios') {
				return modConfig
			}
			const iosRoot = modConfig.modRequest.platformProjectRoot
			const link = join(iosRoot, 'ci_scripts')

			if (existsSync(link)) {
				if (lstatSync(link).isSymbolicLink()) {
					return modConfig
				}
				rmSync(link, { recursive: true, force: true })
			}

			symlinkSync('../config/ios-artifacts/ci_scripts', link, 'dir')
			return modConfig
		}
	])
}

module.exports = withCiScriptsSymlink
