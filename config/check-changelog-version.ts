import appConfig from '../app.config'
import changelogData from '../src/data/changelog.json'
import type { Changelog } from '../src/types/data'
import { validateAppVersionHasChangelogEntries } from '../src/utils/changelog-utils'

const appVersion = appConfig.version
const result = validateAppVersionHasChangelogEntries(
	appVersion,
	changelogData as Changelog
)

if (!result.ok) {
	console.warn(`warning: ${result.reason}`)
	console.warn(
		`Add entries to src/data/changelog.json under version["${result.key}"] before release if you want What's New content for this version.`
	)
	process.exit(0)
}

console.log(
	`Changelog check passed: ${result.count} ${result.count === 1 ? 'entry' : 'entries'} for ${result.key} (app version ${appVersion})`
)
