import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import PlatformIcon from '../Universal/Icon';

const AttributionLink: React.FC = () => {
	const { styles } = useStyles(stylesheet);
	const { t } = useTranslation('common');

	return (
		<View style={styles.attributionContainer}>
			<Pressable
				onPress={() => {
					void Linking.openURL('https://www.openstreetmap.org/copyright');
				}}
				style={styles.attributionLink}
			>
				<Text style={styles.attributionText}>{t('pages.map.details.osm')}</Text>
				<PlatformIcon
					ios={{
						name: 'chevron.forward',
						size: 11
					}}
					android={{
						name: 'chevron_right',
						size: 16
					}}
					web={{
						name: 'ChevronRight',
						size: 16
					}}
					style={styles.label}
				/>
			</Pressable>
		</View>
	);
};

export default AttributionLink;

const stylesheet = createStyleSheet((theme) => ({
	attributionContainer: { paddingVertical: 40 },
	attributionLink: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 4
	},
	attributionText: {
		color: theme.colors.labelColor,
		fontSize: 15,
		paddingStart: 4
	},
	label: {
		color: theme.colors.labelColor
	}
}));
