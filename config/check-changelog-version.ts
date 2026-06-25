import appConfig from '../app.config.json'
import changelogData from '../src/data/changelog.json'
import type { Changelog } from '../src/types/data'
import { validateAppVersionHasChangelogEntries } from '../src/utils/changelog-utils'

const appVersion = appConfig.expo.version
const result = validateAppVersionHasChangelogEntries(
	appVersion,
	changelogData as Changelog
)

if (!result.ok) {
	console.error(`error: ${result.reason}`)
	console.error(
		`Add at least one entry to src/data/changelog.json under version["${result.key}"]`
	)
	process.exit(1)
}

console.log(
	`Changelog check passed: ${result.count} ${result.count === 1 ? 'entry' : 'entries'} for ${result.key} (app version ${appVersion})`
)
