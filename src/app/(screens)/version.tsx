import * as Application from 'expo-application'
import Constants from 'expo-constants'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Linking,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import FormList from '@/components/Universal/FormList'
import type { LucideIcon } from '@/components/Universal/Icon'
import PlatformIcon from '@/components/Universal/Icon'
import type { FormListSections } from '@/types/components'
import type { MaterialIcon } from '@/types/material-icons'
import { formatFriendlyDate } from '@/utils/date-utils'
import { copyToClipboard } from '@/utils/ui-utils'

declare global {
	// eslint-disable-next-line no-var
	var nativeFabricUIManager: unknown
}

export default function Version(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('settings')
	const [systemInfo, setSystemInfo] = useState({
		osVersion: 'N/A',
		deviceModel: 'N/A',
		deviceType: 'N/A',
		isEmulator: false,
		firstInstallTime: 'N/A',
		uiManager: 'N/A',
		browserInfo: 'N/A'
	})

	useEffect(() => {
		const loadSystemInfo = async () => {
			if (Platform.OS === 'web') {
				const userAgent = navigator.userAgent
				const browserInfo = userAgent.replace(/\([^)]*\)/g, '').trim()
				setSystemInfo((prev) => ({
					...prev,
					browserInfo
				}))
				return
			}

			const [osVersion, deviceModel, deviceType, isEmulator, firstInstallTime] =
				await Promise.all([
					DeviceInfo.getSystemVersion(),
					DeviceInfo.getModel(),
					DeviceInfo.getDeviceType(),
					DeviceInfo.isEmulator(),
					DeviceInfo.getFirstInstallTime()
				])

			const uiManager = global.nativeFabricUIManager ? 'Fabric' : 'Paper'

			setSystemInfo({
				osVersion: osVersion ?? 'N/A',
				deviceModel: deviceModel ?? 'N/A',
				deviceType: deviceType ?? 'N/A',
				isEmulator,
				firstInstallTime: firstInstallTime
					? formatFriendlyDate(new Date(firstInstallTime))
					: 'N/A',
				uiManager,
				browserInfo: 'N/A'
			})
		}

		void loadSystemInfo()
	}, [])

	const version =
		Application.nativeApplicationVersion ??
		Constants.expoConfig?.version ??
		'N/A'
	const buildNumber = Application.nativeBuildVersion ?? 'N/A'
	const commitHash =
		process.env.EXPO_PUBLIC_GIT_COMMIT_HASH ?? process.env.GIT_COMMIT_HASH
	const commitHashShort = commitHash?.substring(0, 7) ?? 'N/A'
	const commitUrl = `https://github.com/neuland-ingolstadt/neuland.app-native/commit/${commitHash}`

	const handleCopyAll = async () => {
		const info = [
			'App Information:',
			`Version: ${version}`,
			...(Platform.OS !== 'web' ? [`Build Number: ${buildNumber}`] : []),
			`Commit Hash: ${commitHashShort}`,
			...(Platform.OS !== 'web'
				? [`First Install: ${systemInfo.firstInstallTime}`]
				: []),
			`UI Manager: ${systemInfo.uiManager}`,
			'',
			'System Information:',
			...(Platform.OS === 'web'
				? [`Browser: ${systemInfo.browserInfo}`]
				: [
						`OS Version: ${systemInfo.osVersion}`,
						`Device Model: ${systemInfo.deviceModel}`,
						`Device Type: ${systemInfo.deviceType}`,
						`Emulator: ${systemInfo.isEmulator ? 'Yes' : 'No'}`
					])
		].join('\n')

		copyToClipboard(info, '')
	}

	const sections: FormListSections[] = [
		{
			header: t('version.formlist.app.title'),
			items: [
				{
					title: t('version.formlist.app.version'),
					value: version,
					icon: {
						ios: 'info.circle',
						android: 'info' as MaterialIcon,
						web: 'Info' as LucideIcon
					}
				},
				...(Platform.OS !== 'web'
					? [
							{
								title: t('version.formlist.app.buildNumber'),
								value: buildNumber,
								icon: {
									ios: 'number',
									android: 'pin' as MaterialIcon,
									web: 'Info' as LucideIcon
								}
							}
						]
					: []),
				{
					title: t('version.formlist.app.commitHash'),
					value: commitHashShort,
					icon: {
						ios: 'arrow.triangle.branch',
						android: 'commit' as MaterialIcon,
						web: 'GitBranch' as LucideIcon
					},
					onPress: () => {
						if (commitHash) {
							void Linking.openURL(commitUrl)
						}
					}
				},
				...(Platform.OS !== 'web'
					? [
							{
								title: t('version.formlist.app.firstInstall'),
								value: systemInfo.firstInstallTime,
								icon: {
									ios: 'calendar',
									android: 'calendar_today' as MaterialIcon,
									web: 'Calendar' as LucideIcon
								}
							},
							{
								title: t('version.formlist.app.uiManager'),
								value: systemInfo.uiManager,
								icon: {
									ios: 'atom',
									android: 'code' as MaterialIcon,
									web: 'Atom' as LucideIcon
								}
							}
						]
					: [])
			]
		},
		{
			header: t('version.formlist.system.title'),
			items:
				Platform.OS === 'web'
					? [
							{
								title: t('version.formlist.system.browser'),
								value: systemInfo.browserInfo,
								icon: {
									ios: 'safari',
									android: 'web' as MaterialIcon,
									web: 'Globe' as LucideIcon
								}
							}
						]
					: [
							{
								title: t('version.formlist.system.osVersion'),
								value: systemInfo.osVersion,
								icon: {
									ios: 'apple.logo',
									android: 'android' as MaterialIcon,
									web: 'Monitor' as LucideIcon
								}
							},
							{
								title: t('version.formlist.system.deviceModel'),
								value: systemInfo.deviceModel,
								icon: {
									ios: 'iphone',
									android: 'smartphone' as MaterialIcon,
									web: 'Smartphone' as LucideIcon
								}
							},
							{
								title: t('version.formlist.system.deviceType'),
								value: systemInfo.deviceType,
								icon: {
									ios: 'desktopcomputer',
									android: 'computer' as MaterialIcon,
									web: 'Monitor' as LucideIcon
								}
							},
							{
								title: t('version.formlist.system.emulator'),
								value: systemInfo.isEmulator ? 'Yes' : 'No',
								icon: {
									ios: 'cube',
									android: 'box' as MaterialIcon,
									web: 'Box' as LucideIcon
								}
							}
						]
		}
	]

	return (
		<ScrollView contentContainerStyle={styles.contentContainer}>
			<FormList sections={sections} />
			<Pressable style={styles.copyButton} onPress={handleCopyAll}>
				<PlatformIcon
					ios={{
						name: 'doc.on.doc',
						size: 18
					}}
					android={{
						name: 'content_copy',
						size: 22,
						variant: 'outlined'
					}}
					web={{
						name: 'Copy',
						size: 22
					}}
				/>
				<Text style={styles.copyButtonText}>{t('version.copyButton')}</Text>
			</Pressable>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	contentContainer: {
		padding: theme.margins.page,
		paddingBottom: theme.margins.bottomSafeArea
	},
	copyButton: {
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.mg,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: theme.colors.border,
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'center',
		marginBottom: 30,
		marginTop: 30,
		minWidth: 165,
		paddingHorizontal: 40,
		paddingVertical: 12
	},
	copyButtonText: {
		color: theme.colors.primary,
		fontSize: 16
	}
}))
