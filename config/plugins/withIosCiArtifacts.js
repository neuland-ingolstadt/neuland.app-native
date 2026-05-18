const { withDangerousMod } = require('expo/config-plugins')
const { copyFileSync, existsSync, mkdirSync } = require('node:fs')
const { dirname, join } = require('node:path')

/** Paths under `config/ios-artifacts/` → same path under `ios/` */
const ARTIFACTS = [
	'ci_scripts/ci_post_clone.sh',
	'TestFlight/WhatToTest.en-US.txt',
	'TestFlight/WhatToTest.de-DE.txt'
]

function withIosCiArtifacts(expoConfig) {
	return withDangerousMod(expoConfig, [
		'ios',
		(modConfig) => {
			if (modConfig.modRequest.platform !== 'ios') {
				return modConfig
			}
			const projectRoot = modConfig.modRequest.projectRoot
			const iosRoot = modConfig.modRequest.platformProjectRoot
			const srcRoot = join(projectRoot, 'config', 'ios-artifacts')

			for (const rel of ARTIFACTS) {
				const from = join(srcRoot, rel)
				const to = join(iosRoot, rel)
				if (!existsSync(from)) {
					throw new Error(
						`withIosCiArtifacts: missing source file ${from} (edit files under config/ios-artifacts/)`
					)
				}
				mkdirSync(dirname(to), { recursive: true })
				copyFileSync(from, to)
			}
			return modConfig
		}
	])
}

module.exports = withIosCiArtifacts
