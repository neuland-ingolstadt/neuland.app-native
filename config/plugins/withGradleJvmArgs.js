const { withGradleProperties } = require('expo/config-plugins')

const GRADLE_JVM_ARGS_KEY = 'org.gradle.jvmargs'
const GRADLE_JVM_ARGS_VALUE =
	'-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError'

function withGradleJvmArgs(expoConfig) {
	return withGradleProperties(expoConfig, (config) => {
		const index = config.modResults.findIndex(
			(item) => item.type === 'property' && item.key === GRADLE_JVM_ARGS_KEY
		)

		if (index >= 0) {
			config.modResults[index].value = GRADLE_JVM_ARGS_VALUE
		} else {
			config.modResults.push({
				type: 'property',
				key: GRADLE_JVM_ARGS_KEY,
				value: GRADLE_JVM_ARGS_VALUE
			})
		}

		return config
	})
}

module.exports = withGradleJvmArgs
