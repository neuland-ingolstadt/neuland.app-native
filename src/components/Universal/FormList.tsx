import Divider from '@/components/Universal/Divider';
import type { FormListSections, SectionGroup } from '@/types/components';
import React from 'react';
import { Platform, Text, View, type ViewStyle } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Pressable } from 'react-native-gesture-handler';
import PlatformIcon from './Icon';

interface FormListProps {
	sections: FormListSections[];
	rowStyle?: ViewStyle;
	privacyHidden?: boolean;
}

interface RenderSectionFrameProps {
	sectionIndex: number;
	children: React.ReactNode;
	footer?: string;
	header?: string;
}

interface RenderSectionItemProps {
	sectionIndex: number;
	section: FormListSections;
}

const RenderSectionItem: React.FC<RenderSectionItemProps> = ({
	sectionIndex,
	section
}) => {
	const { styles } = useStyles(stylesheet);
	return (
		<View key={sectionIndex} style={styles.block}>
			<View style={[styles.blockCard, styles.itemBlock]}>
				<Text style={styles.columnDetails}>{section.item}</Text>
			</View>
		</View>
	);
};

const RenderSectionFrame: React.FC<RenderSectionFrameProps> = ({
	sectionIndex,
	children,
	footer,
	header
}) => {
	const { styles } = useStyles(stylesheet);

	return (
		<View key={sectionIndex} style={styles.block}>
			{header != null && <Text style={styles.blockHeader}>{header}</Text>}
			{children}
			{footer != null && <Text style={styles.blockFooter}>{footer}</Text>}
		</View>
	);
};

const RenderSectionItems: React.FC<{
	items: SectionGroup[];
	privacyHidden: boolean;
	rowStyle?: ViewStyle;
}> = ({ items, privacyHidden, rowStyle }) => {
	const { styles, theme } = useStyles(stylesheet);

	const handlePress = (onPress?: () => Promise<void> | void): void => {
		if (onPress != null) {
			Promise.resolve(onPress()).catch((error) => {
				console.error(error);
			});
		}
	};

	return (
		<View style={styles.blockCard}>
			{items.map((item, index) => (
				<React.Fragment key={index}>
					<Pressable
						onPress={() => {
							handlePress(item.onPress);
						}}
						style={({ pressed }) => [
							{
								opacity: pressed ? 0.9 : 1
							}
						]}
						disabled={item.disabled ?? item.onPress === undefined}
					>
						<View
							style={{
								...(item.layout === 'column'
									? styles.cardColumn
									: styles.cardRow),
								...rowStyle
							}}
						>
							{item.title != null && (
								<Text style={styles.rowTitle}>{item.title}</Text>
							)}

							{item.value != null && !privacyHidden && (
								<Text
									style={[
										item.layout === 'column'
											? styles.columnDetails
											: styles.rowDetails,
										{
											color: item.textColor ?? theme.colors.labelColor,
											fontWeight: item.fontWeight ?? 'normal'
										}
									]}
									selectable={item.selectable ?? false}
								>
									{item.value}
								</Text>
							)}
							{item.icon != null && (
								<PlatformIcon
									ios={{
										name: item.icon.ios,
										fallback: item.icon.iosFallback,

										size: (item.icon.iosFallback ?? false) ? 20 : 16
									}}
									android={{
										name: item.icon.android,
										size: 18,
										variant: item.icon.androidVariant
									}}
									web={{
										name: item.icon.web,
										size: 18
									}}
									// eslint-disable-next-line react-native/no-inline-styles
									style={{
										marginLeft: item.value != null ? 6 : 0,
										marginTop: Platform.OS === 'android' ? 2 : 0,
										color: item.iconColor ?? theme.colors.labelSecondaryColor
									}}
								/>
							)}
						</View>
					</Pressable>

					{index < items.length - 1 && <Divider iosPaddingLeft={16} />}
				</React.Fragment>
			))}
		</View>
	);
};
/**
 * A component that renders a list of forms with headers and footers.
 * @param {FormListSections[]} sections - An array of sections, each containing a header, footer, and an array of items.
 * @returns {JSX.Element} - A React component that renders the list of forms.
 */
const FormList: React.FC<FormListProps> = ({
	sections,
	rowStyle,
	privacyHidden
}) => {
	const { styles } = useStyles(stylesheet);

	return (
		<View style={styles.wrapper}>
			{sections.map((section, sectionIndex) =>
				section.items !== undefined && section.items.length > 0 ? (
					<RenderSectionFrame
						key={sectionIndex}
						sectionIndex={sectionIndex}
						header={section.header}
						footer={section.footer}
					>
						<RenderSectionItems
							items={section.items}
							rowStyle={rowStyle}
							privacyHidden={privacyHidden ?? false}
						/>
					</RenderSectionFrame>
				) : section.item != null ? (
					<RenderSectionFrame
						key={sectionIndex}
						sectionIndex={sectionIndex}
						header={section.header}
						footer={section.footer}
					>
						<RenderSectionItem sectionIndex={sectionIndex} section={section} />
					</RenderSectionFrame>
				) : null
			)}
		</View>
	);
};

const stylesheet = createStyleSheet((theme) => ({
	block: {
		gap: 6
	},
	blockCard: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md
	},
	blockFooter: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 12,
		fontWeight: '400'
	},
	blockHeader: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: 'normal',
		textTransform: 'uppercase'
	},
	cardColumn: {
		alignItems: 'flex-start',
		flexDirection: 'column',
		marginVertical: 13,
		paddingHorizontal: 15
	},
	cardRow: {
		alignItems: 'center',
		flexDirection: 'row',
		marginVertical: 13,
		paddingHorizontal: 16
	},
	columnDetails: {
		color: theme.colors.text,
		fontSize: 16,
		paddingTop: 2,
		textAlign: 'left'
	},
	itemBlock: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		paddingHorizontal: 16,
		paddingVertical: 13
	},
	rowDetails: {
		fontSize: 16,
		maxWidth: '65%',
		textAlign: 'right'
	},
	rowTitle: {
		color: theme.colors.text,
		flexGrow: 1,
		flexShrink: 1,
		flexWrap: 'wrap',
		fontSize: 16
	},
	wrapper: {
		gap: 16,
		width: '100%'
	}
}));

export default FormList;
