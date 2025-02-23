import ErrorView from '@/components/Error/ErrorView';
import type React from 'react';
import { useTranslation } from 'react-i18next';

export default function NotesDetails(): React.JSX.Element {
	const { t } = useTranslation('timetable');

	return (
		<>
			<ErrorView
				title={t('error.web.title')}
				message={t('error.web.message')}
				isCritical={false}
			/>
		</>
	);
}
