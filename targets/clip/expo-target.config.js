/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = () => ({
	type: 'clip',
	name: 'clip',
	displayName: 'Neuland Mensa',
	icon: '../../src/assets/appIcons/default.png',
	deploymentTarget: '17.6',
	bundleIdentifier: '.clip',
	exportJs: true,
	entitlements: {
		'com.apple.developer.associated-domains': [
			'appclips:web.neuland.app',
			'appclips:dev.neuland.app'
		]
	}
})
