import type React from 'react';
import { StyleSheet, View } from 'react-native';

export default function DetailsSymbol({
	children
}: {
	children: JSX.Element;
}): React.JSX.Element {
	return <View style={styles.detailsSymbol}>{children}</View>;
}

const styles = StyleSheet.create({
	detailsSymbol: {
		display: 'flex',
		flexDirection: 'row',
		width: 50,
		justifyContent: 'center',
		alignItems: 'center'
	}
});
