import type React from 'react'
import { useTranslation } from 'react-i18next'
import ErrorView from '@/components/Error/error-view'

export default function AppIconPicker(): React.JSX.Element {
	const { t } = useTranslation(['settings'])
	return (
		<ErrorView
			message={t('appIcon.error.message')}
			title={t('appIcon.error.title')}
			isCritical={false}
		/>
	)
}
