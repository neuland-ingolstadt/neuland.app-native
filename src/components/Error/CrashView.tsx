import { trackEvent } from '@aptabase/react-native';
import { type ErrorBoundaryProps, usePathname } from 'expo-router';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import LogoTextSVG from '../Flow/svgs/logoText';
import PlatformIcon from '../Universal/Icon';
import StatusBox from './ActionBox';

export const ErrorButton = ({
	onPress
}: {
	onPress: () => void;
}): React.JSX.Element => {
	const { t } = useTranslation('common');
	const { styles } = useStyles(stylesheet);
	return (
		<Pressable style={styles.logoutContainer} onPress={onPress}>
			<View style={styles.refreshButton}>
				<Text style={styles.refreshButtonText}>{t('error.crash.reload')}</Text>
			</View>
		</Pressable>
	);
};

export default function CrashView({
	error,
	retry
}: ErrorBoundaryProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet);
	const { t } = useTranslation('common');
	const path = usePathname();
	trackEvent('ErrorView', {
		title: error.message,
		path,
		crash: true
	});

	const handlePress = (): void => {
		retry().catch((error) => {
			console.info('Error while retrying', error);
		});
	};

	return (
		<View style={styles.flex}>
			<View style={styles.innerContainer}>
				<View style={styles.topContainer}>
					<PlatformIcon
						ios={{
							name: 'pc',
							size: 80,
							renderMode: 'multicolor'
						}}
						android={{
							name: 'error',
							size: 80
						}}
						web={{
							name: 'ServerCrash',
							size: 80
						}}
					/>
					<Text style={styles.errorTitle}>{t('error.crash.title')}</Text>
					<Text style={styles.errorInfo}>{t('error.crash.description')}</Text>
				</View>

				<StatusBox error={error} crash={true} />
				<ErrorButton onPress={handlePress} />
			</View>
			<View style={styles.logoContainer}>
				<LogoTextSVG size={15} color={theme.colors.labelSecondaryColor} />
			</View>
		</View>
	);
}

const stylesheet = createStyleSheet((theme) => ({
	errorInfo: {
		color: theme.colors.text,
		fontSize: 18,
		textAlign: 'center'
	},
	errorTitle: {
		color: theme.colors.text,
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 8,
		marginTop: 8,
		textAlign: 'center'
	},

	flex: {
		backgroundColor: theme.colors.background,
		flex: 1
	},
	innerContainer: {
		alignItems: 'center',
		alignSelf: 'center',
		flex: 1,
		justifyContent: 'space-evenly',
		paddingVertical: 20,
		width: '85%'
	},
	logoContainer: {
		alignSelf: 'center',
		bottom: 30,
		position: 'absolute'
	},
	logoutContainer: {
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.mg
	},
	refreshButton: {
		alignItems: 'center',
		flexDirection: 'row',
		paddingHorizontal: 30,
		paddingVertical: 10
	},
	refreshButtonText: {
		color: theme.colors.primary,
		fontSize: 16,
		fontWeight: '600'
	},
	topContainer: { alignItems: 'center', gap: 20 }
}));
