import type React from 'react';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import * as ContextMenu from 'zeego/dropdown-menu';

type ItemProps = React.ComponentProps<(typeof ContextMenu)['Separator']>;

const ContextMenuSeparator = ContextMenu.create((props: ItemProps) => {
	const { styles } = useStyles(stylesheet);
	return <ContextMenu.Separator style={styles.item} {...props} />;
}, 'Separator');

export default ContextMenuSeparator;

const stylesheet = createStyleSheet((theme) => ({
	item: {
		backgroundColor: theme.colors.labelTertiaryColor,
		height: 1,
		marginBottom: 4,
		marginTop: 4
	}
}));
