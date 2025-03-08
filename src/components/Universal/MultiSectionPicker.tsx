import Divider from '@/components/Universal/Divider';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import PlatformIcon from './Icon';

interface Element {
	title: string;
	key: string;
}

interface SectionPickerProps {
	elements: Element[];
	selectedItems: string[];
	action: (item: string) => void;
}

/**
 * A component that renders a list of selectable items with a title and a checkmark icon.
 * @param {Element[]} elements - The list of selectable items.
 * @param {string[]} selectedItems - The list of selected items.
 * @param {(item: string) => void} action - The function to be called when an item is selected.
 * @returns {JSX.Element} - The MultiSectionPicker component.
 */
const MultiSectionPicker: React.FC<SectionPickerProps> = ({
	elements,
	selectedItems,
	action
}) => {
	const { styles } = useStyles(stylesheet);

	return (
		<>
			{elements.map((item, index) => (
				<React.Fragment key={index}>
					<Pressable
						onPress={() => {
							action(item.key);
						}}
						style={styles.button}
					>
						<View style={styles.container}>
							<Text style={styles.text}>{item.title}</Text>
							{selectedItems.includes(item.key) ? (
								<PlatformIcon
									ios={{
										name: 'checkmark',
										size: 15
									}}
									android={{
										name: 'check',
										size: 18
									}}
									web={{
										name: 'Check',
										size: 18
									}}
								/>
							) : (
								<></>
							)}
						</View>
					</Pressable>
					{index < elements.length - 1 && <Divider iosPaddingLeft={16} />}
				</React.Fragment>
			))}
		</>
	);
};

const stylesheet = createStyleSheet((theme) => ({
	button: {
		padding: 8
	},
	container: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginRight: 8,
		paddingHorizontal: 6,
		paddingVertical: 4
	},
	text: {
		color: theme.colors.text,
		fontSize: 16,
		paddingVertical: 1
	}
}));

export default MultiSectionPicker;
