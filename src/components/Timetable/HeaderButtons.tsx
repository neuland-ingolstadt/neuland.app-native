import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import PlatformIcon from '../Universal/Icon';

interface HeaderRightProps {
	setToday: () => void;
}

export function HeaderRight({ setToday }: HeaderRightProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet);
	const { t } = useTranslation(['accessibility']);
	return (
		<Pressable
			onPressOut={setToday}
			style={styles.headerButton}
			hitSlop={10}
			accessibilityLabel={t('button.timetableBack')}
		>
			<PlatformIcon
				ios={{
					name: 'arrow.uturn.left',
					size: 22
				}}
				android={{
					name: 'keyboard_return',
					size: 24
				}}
				web={{
					name: 'Undo2',
					size: 24
				}}
				style={styles.icon}
			/>
		</Pressable>
	);
}

const stylesheet = createStyleSheet((theme) => ({
	headerButton: {
		marginHorizontal: Platform.OS !== 'ios' ? 14 : 0
	},
	icon: {
		color: theme.colors.text
	}
}));
