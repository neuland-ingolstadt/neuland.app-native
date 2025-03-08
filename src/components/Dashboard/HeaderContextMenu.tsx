import { queryClient } from '@/components/provider';
import type { UserKindContextType } from '@/contexts/userKind';
import { USER_GUEST } from '@/data/constants';
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore';
import { usePreferencesStore } from '@/hooks/usePreferencesStore';
import { performLogout } from '@/utils/api-utils';
import { type RelativePathString, router } from 'expo-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';
import { DashboardContext, UserKindContext } from '../contexts';

interface HeaderContextMenuProps {
	children: JSX.Element;
	personName?: string;
}

export function HeaderContextMenu({
	children,
	personName
}: HeaderContextMenuProps): JSX.Element {
	const { t } = useTranslation(['navigation', 'settings']);
	const resetPreferences = usePreferencesStore((state) => state.reset);
	const resetFood = useFoodFilterStore((state) => state.reset);
	const { toggleUserKind } = useContext(UserKindContext);
	const { resetOrder } = useContext(DashboardContext);
	const { userKind = USER_GUEST } =
		useContext<UserKindContextType>(UserKindContext);
	const handleItemPress = (action: string) => {
		if (action === t('navigation.profile')) {
			router.navigate('/profile' as RelativePathString);
		} else if (action === t('navigation.accent')) {
			router.navigate('/accent' as RelativePathString);
		} else if (action === t('navigation.about')) {
			router.navigate('/about' as RelativePathString);
		} else if (action === 'Logout') {
			logoutAlert();
		} else if (action === t('menu.guest.title', { ns: 'settings' })) {
			router.navigate('/login' as RelativePathString);
		}
	};

	const handlePreviewPress = () => {
		router.navigate('/settings' as RelativePathString);
	};

	const logoutAlert = (): void => {
		Alert.alert(
			t('profile.logout.alert.title', {
				ns: 'settings'
			}),
			t('profile.logout.alert.message', {
				ns: 'settings'
			}),
			[
				{
					text: t('profile.logout.alert.cancel', {
						ns: 'settings'
					}),
					style: 'cancel'
				},
				{
					text: t('profile.logout.alert.confirm', { ns: 'settings' }),
					style: 'destructive',
					onPress: () => {
						resetPreferences();
						resetFood();
						performLogout(toggleUserKind, resetOrder, queryClient).catch(
							(e) => {
								console.log(e);
							}
						);
					}
				}
			]
		);
	};

	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger>{children}</ContextMenu.Trigger>

			<ContextMenu.Content>
				<ContextMenu.Preview onPress={handlePreviewPress}>
					{children}
				</ContextMenu.Preview>

				{userKind === 'student' && personName && (
					<ContextMenu.Item
						key="profile"
						onSelect={() => handleItemPress(t('navigation.profile'))}
					>
						<ContextMenu.ItemIcon
							ios={{
								name: 'person.crop.circle'
							}}
						/>
						<ContextMenu.ItemTitle>
							{t('navigation.profile')}
						</ContextMenu.ItemTitle>
						<ContextMenu.ItemSubtitle>{personName}</ContextMenu.ItemSubtitle>
					</ContextMenu.Item>
				)}

				<ContextMenu.Item
					key="accent"
					onSelect={() => handleItemPress(t('navigation.accent'))}
				>
					<ContextMenu.ItemIcon
						ios={{
							name: 'paintpalette'
						}}
					/>
					<ContextMenu.ItemTitle>
						{t('navigation.accent')}
					</ContextMenu.ItemTitle>
				</ContextMenu.Item>

				<ContextMenu.Item
					key="about"
					onSelect={() => handleItemPress(t('navigation.about'))}
				>
					<ContextMenu.ItemIcon
						ios={{
							name: 'info.circle'
						}}
					/>
					<ContextMenu.ItemTitle>{t('navigation.about')}</ContextMenu.ItemTitle>
				</ContextMenu.Item>

				{userKind !== USER_GUEST && (
					<ContextMenu.Item
						key="logout"
						destructive
						onSelect={() => handleItemPress('Logout')}
					>
						<ContextMenu.ItemIcon
							ios={{
								name: 'person.fill.xmark'
							}}
						/>
						<ContextMenu.ItemTitle>Logout</ContextMenu.ItemTitle>
					</ContextMenu.Item>
				)}

				{userKind === USER_GUEST && (
					<ContextMenu.Item
						key="login"
						onSelect={() =>
							handleItemPress(t('menu.guest.title', { ns: 'settings' }))
						}
					>
						<ContextMenu.ItemIcon
							ios={{
								name: 'person.fill.questionmark'
							}}
						/>
						<ContextMenu.ItemTitle>
							{t('menu.guest.title', { ns: 'settings' })}
						</ContextMenu.ItemTitle>
					</ContextMenu.Item>
				)}
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}
