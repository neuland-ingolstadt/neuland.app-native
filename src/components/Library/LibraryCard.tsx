import PlatformIcon, { type LucideIcon } from '@/components/Universal/Icon';
import type { MaterialIcon } from '@/types/material-icons';
import type React from 'react';
import {
	type GestureResponderEvent,
	Pressable,
	Text,
	View
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface LibraryCardProps {
	onPress: ((event: GestureResponderEvent) => void) | null | undefined;
	iconProps: {
		ios: { name: string; size: number };
		android: {
			name: MaterialIcon;
			size: number;
			variant?: 'outlined' | 'filled';
		};
		web: { name: LucideIcon; size: number };
	};
	title: string;
	description: string;
}

/**
 * LibraryCard
 * @param onPress Pressable event
 * @param iconProps Icon properties
 * @param title Title of the card
 * @param description Description of the card
 * @returns JSX.Element
 */
const LibraryCard = ({
	onPress,
	iconProps,
	title,
	description
}: LibraryCardProps): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet);
	return (
		<Pressable style={styles.pressable} onPress={onPress}>
			<View style={styles.container}>
				<View style={styles.row}>
					<PlatformIcon
						{...iconProps}
						style={{ color: theme.colors.primary }}
					/>
					<Text style={styles.title}>{title}</Text>
				</View>
				<Text style={styles.description} numberOfLines={3}>
					{description}
				</Text>
			</View>
			<PlatformIcon
				ios={{ name: 'chevron.forward', size: 18 }}
				android={{ name: 'chevron_right', size: 24 }}
				web={{ name: 'ChevronRight', size: 24 }}
				style={{ color: theme.colors.labelColor }}
			/>
		</Pressable>
	);
};

export default LibraryCard;

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flexDirection: 'column',
		flex: 1,
		gap: 4,
		justifyContent: 'center'
	},
	description: { color: theme.colors.text, fontSize: 14 },
	pressable: {
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: 8,
		flexDirection: 'row',
		gap: 6,
		justifyContent: 'space-between',
		padding: 16
	},
	row: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 6
	},
	title: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: 'bold'
	}
}));
