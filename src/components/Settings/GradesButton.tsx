import { handleBiometricAuth } from '@/utils/app-utils';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Pressable } from 'react-native-gesture-handler';
import PlatformIcon from '../Universal/Icon';

const GradesButton = (): React.JSX.Element => {
	const { t } = useTranslation('settings');
	const { styles } = useStyles(stylesheet);
	return (
		<Pressable
			onPress={() => {
				void handleBiometricAuth('grades');
			}}
			style={styles.gradesRow}
		>
			<Text style={styles.gradesText}>
				{t('profile.formlist.grades.button')}
			</Text>
			<PlatformIcon
				ios={{
					name: 'book',
					size: 15
				}}
				android={{
					name: 'bar_chart_4_bars',
					size: 18
				}}
				web={{
					name: 'ChartColumnBig',
					size: 18
				}}
				style={styles.icon}
			/>
		</Pressable>
	);
};

const stylesheet = createStyleSheet((theme) => ({
	gradesRow: {
		flexDirection: 'row',
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 13
	},
	gradesText: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 16
	},
	icon: {
		alignSelf: 'center',
		color: theme.colors.labelSecondaryColor
	}
}));

export default GradesButton;
