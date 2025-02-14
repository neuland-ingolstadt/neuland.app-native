import type { MaterialIcon } from '@/types/material-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FileWarning, icons } from 'lucide-react-native';
import type React from 'react';
import { Platform, Text, type TextStyle, type ViewStyle } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import SweetSFSymbol from 'sweet-sfsymbols';
import type { SystemName } from 'sweet-sfsymbols/build/SweetSFSymbols.types';

export type LucideIcon = keyof typeof icons;
interface PlatformIconProps {
	android: {
		name: MaterialIcon | CommunityIcon;
		size: number;
		variant?: 'filled' | 'outlined';
	};
	ios: {
		name: string;
		size: number;
		weight?:
			| 'ultraLight'
			| 'thin'
			| 'light'
			| 'regular'
			| 'medium'
			| 'semibold'
			| 'bold'
			| 'heavy'
			| 'black';
		variant?: string;
		fallback?: boolean;
		renderMode?:
			| 'multicolor'
			| 'monochrome'
			| 'hierarchical'
			| 'palette'
			| undefined;
		variableValue?: number | undefined;
		additionalColor?: string;
	};
	web: {
		name: LucideIcon;
		size: number;
	};
	style?: TextStyle;
}

export const lucidErrorIcon = {
	name: 'error',
	size: 24,
	color: 'red'
};

export const linkIcon = {
	ios: 'safari',
	android: 'link' as MaterialIcon,
	web: 'Link' as LucideIcon
};

export const chevronIcon = {
	ios: 'chevron.forward',
	android: 'chevron_right' as MaterialIcon,
	web: 'ChevronRight' satisfies LucideIcon as LucideIcon
};

const PlatformIcon = ({
	android,
	ios,
	web,
	style
}: PlatformIconProps): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet);

	const lucidFallback = <FileWarning size={24} color={lucidErrorIcon.color} />;

	if (Platform.OS === 'web') {
		if (web != null) {
			const LucideIcon = icons[web.name];

			return (
				<LucideIcon
					size={web.size}
					color={style?.color ?? theme.colors.primary}
					style={style as ViewStyle}
				/>
			);
		}
		return lucidFallback;
	}
	if (Platform.OS === 'ios') {
		return (ios.fallback ?? false) ? (
			<MaterialCommunityIcons
				name={ios.name as keyof typeof MaterialCommunityIcons.glyphMap}
				size={ios.size}
				color={style?.color ?? theme.colors.primary}
				style={{
					width: ios.size,
					height: ios.size,
					...styles.iosFallbackOffset,
					...style
				}}
			/>
		) : (
			<SweetSFSymbol
				name={ios.name as SystemName}
				size={ios.size}
				colors={[
					style?.color ?? theme.colors.primary,
					...(ios.additionalColor != null ? [ios.additionalColor] : [])
				]}
				weight={ios.weight ?? 'regular'}
				style={style as ViewStyle}
				variant={ios.variant as never}
				variableValue={ios.variableValue}
				renderingMode={ios.renderMode}
			/>
		);
	}
	return (
		<Text
			style={{
				...styles.androidIcon,
				...(android.variant === 'outlined'
					? styles.androidIconOutlined
					: styles.androidIconFilled),
				fontSize: android.size,
				lineHeight: android.size,
				color: style?.color ?? theme.colors.primary,
				...style
			}}
		>
			{communityIcons.includes(android.name) ? (
				<MaterialCommunityIcons
					name={android.name as keyof typeof MaterialCommunityIcons.glyphMap}
					size={android.size}
					color={style?.color ?? theme.colors.primary}
					style={{ ...styles.communityIcon, ...style }}
				/>
			) : (
				android.name
			)}
		</Text>
	);
};

export default PlatformIcon;

const communityIcons: string[] = ['instagram', 'github'];

export type CommunityIcon = 'instagram' | 'github' | 'map-marker';

const stylesheet = createStyleSheet(() => ({
	androidIcon: {
		paddingTop: 3
	},
	androidIconFilled: {
		fontFamily: 'MaterialSymbolsRoundedFill'
	},
	androidIconOutlined: {
		fontFamily: 'MaterialSymbolsRoundedOutline'
	},
	communityIcon: {
		paddingTop: 50
	},
	iosFallbackOffset: {
		marginRight: -2
	}
}));
