import { Avatar } from '@/components/Settings';
import PlatformIcon from '@/components/Universal/Icon';
import { UserKindContext } from '@/components/contexts';
import type { UserKindContextType } from '@/contexts/userKind';
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants';
import { getPersonalData, getUsername } from '@/utils/api-utils';
import { loadSecure } from '@/utils/storage';
import { getContrastColor, getInitials } from '@/utils/ui-utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import LoadingIndicator from '../Universal/LoadingIndicator';
import { HeaderContextMenu } from './HeaderContextMenu';

export const IndexHeaderRight = (): React.JSX.Element => {
	const { t } = useTranslation(['navigation', 'settings']);
	const router = useRouter();
	const { styles, theme } = useStyles(stylesheet);
	const { userKind = USER_GUEST } =
		useContext<UserKindContextType>(UserKindContext);
	const username = userKind === USER_EMPLOYEE && loadSecure('username');

	const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
	const [initials, setInitials] = useState('');

	const {
		data: persData,
		isError,
		isSuccess
	} = useQuery({
		queryKey: ['personalData'],
		queryFn: async () => {
			setShowLoadingIndicator(true);
			const data = await getPersonalData();
			setShowLoadingIndicator(false);
			return data;
		},
		staleTime: 1000 * 60 * 60 * 12, // 12 hours
		gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
		enabled: userKind === USER_STUDENT
	});

	useEffect(() => {
		if (isError) {
			setShowLoadingIndicator(false);
		}
	}, [isError]);

	useEffect(() => {
		const fetchUsernameAndSetInitials = (): void => {
			if (userKind === USER_STUDENT && persData !== undefined) {
				const initials = getInitials(`${persData.vname} ${persData.name}`);
				setInitials(initials);
			} else if (userKind === USER_EMPLOYEE) {
				const username = getUsername();
				if (username !== undefined) {
					setInitials(getInitials(username));
				}
			} else {
				setInitials('');
			}
		};
		fetchUsernameAndSetInitials();
	}, [persData, userKind]);

	const IconComponent = (): React.JSX.Element => {
		return userKind === USER_EMPLOYEE ? (
			<Avatar size={28}>
				<Text
					style={{
						color: getContrastColor(theme.colors.primary),
						...styles.iconText
					}}
					numberOfLines={1}
					adjustsFontSizeToFit={true}
				>
					{getInitials((username as string) ?? '')}
				</Text>
			</Avatar>
		) : userKind === USER_GUEST || isError ? (
			<PlatformIcon
				ios={{
					name: 'person.crop.circle',
					size: 24
				}}
				android={{
					name: 'account_circle',
					size: 26
				}}
				web={{
					name: 'CircleUser',
					size: 24
				}}
				style={styles.icon}
			/>
		) : userKind === USER_STUDENT &&
			isSuccess &&
			persData?.mtknr === undefined ? (
			<PlatformIcon
				ios={{
					name: 'person.crop.circle.badge.exclamationmark',
					size: 24
				}}
				android={{
					name: 'account_circle_off',
					size: 26
				}}
				web={{
					name: 'UserX',
					size: 24
				}}
				style={styles.icon}
			/>
		) : initials !== '' || !showLoadingIndicator ? (
			<Avatar size={28}>
				<Text
					style={{
						color: getContrastColor(theme.colors.primary),
						...styles.iconText
					}}
					numberOfLines={1}
					adjustsFontSizeToFit={true}
				>
					{initials}
				</Text>
			</Avatar>
		) : (
			<LoadingIndicator style={styles.center} />
		);
	};

	const MemoIcon = React.useMemo(
		() => <IconComponent />,
		[userKind, initials, showLoadingIndicator, theme.colors]
	);

	// Prepare person name for context menu subtitle if available
	const personName =
		userKind === 'student' && persData
			? `${persData.vname} ${persData.name}`
			: undefined;

	return (
		<HeaderContextMenu personName={personName}>
			<Pressable
				onPress={() => {
					router.navigate('/settings');
				}}
				delayLongPress={300}
				onLongPress={() => {
					/* nothing */
				}}
				accessibilityLabel={t('navigation.settings')}
				style={styles.element}
			>
				{MemoIcon}
			</Pressable>
		</HeaderContextMenu>
	);
};

const stylesheet = createStyleSheet((theme) => ({
	center: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	element: {
		marginEnd: Platform.OS !== 'ios' ? 14 : 0
	},
	icon: {
		color: theme.colors.text
	},
	iconText: {
		fontSize: 13,
		fontWeight: 'bold'
	}
}));
