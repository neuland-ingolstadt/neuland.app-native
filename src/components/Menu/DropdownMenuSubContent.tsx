import type React from 'react';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import * as DropdownMenu from 'zeego/dropdown-menu';

type ItemProps = React.ComponentProps<(typeof DropdownMenu)['SubContent']>;

const DropdownMenuSubContent = DropdownMenu.create((props: ItemProps) => {
	const { styles } = useStyles(stylesheet);
	return <DropdownMenu.SubContent style={styles.item} {...props} />;
}, 'SubContent');

export default DropdownMenuSubContent;

const stylesheet = createStyleSheet((theme) => ({
	item: {
		backgroundColor: theme.colors.cardContrast,
		borderColor: theme.colors.text,
		borderRadius: 10,

		borderWidth: 1,
		fontSize: 18,
		margin: 10,
		padding: 5
	}
}));
