#!/usr/bin/env node
const { join } = require('node:path')
const {
	applySentryEnv,
	printShellExports,
	writeSentryBuildPluginFile
} = require('./env')
const { uploadOta } = require('./upload')

const projectRoot = join(__dirname, '../../..')

function usage() {
	console.error(`Usage: rustrak-sourcemaps <command> [options]

Commands:
  env [--shell] [--no-local-env]   Write .env.sentry-build-plugin / export shell env
  ota [dir] [--strip] [--required] Upload Expo export / OTA sourcemaps
                               (--strip removes .map files after upload)
`)
	process.exit(1)
}

function parseFlags(argv) {
	return {
		strip: argv.includes('--strip'),
		required: argv.includes('--required'),
		shell: argv.includes('--shell'),
		noLocalEnv: argv.includes('--no-local-env'),
		positionals: argv.filter((arg) => !arg.startsWith('--'))
	}
}

function main() {
	const [command, ...rest] = process.argv.slice(2)
	if (!command) {
		usage()
	}

	const flags = parseFlags(rest)

	switch (command) {
		case 'env': {
			if (flags.shell) {
				printShellExports(projectRoot, {
					loadLocalEnv: !flags.noLocalEnv
				})
				break
			}
			writeSentryBuildPluginFile(projectRoot, {
				loadLocalEnv: !flags.noLocalEnv
			})
			applySentryEnv(projectRoot, {
				loadLocalEnv: !flags.noLocalEnv
			})
			break
		}
		case 'ota': {
			const dir = flags.positionals[0] ?? 'dist'
			uploadOta(projectRoot, dir, {
				strip: flags.strip,
				required: flags.required
			})
			break
		}
		default:
			usage()
	}
}

main()
