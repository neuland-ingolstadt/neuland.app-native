import type { CampusLifeEventFieldsFragment } from '@/__generated__/gql/graphql';
import ErrorView from '@/components/Error/ErrorView';
import CLEventRow from '@/components/Rows/EventRow';
import Divider from '@/components/Universal/Divider';
import { useRefreshByUser } from '@/hooks';
import { networkError } from '@/utils/api-utils';
import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, RefreshControl, ScrollView, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import LoadingIndicator from '../Universal/LoadingIndicator';

export default function ClEventsPage({
	clEventsResult
}: {
	clEventsResult: UseQueryResult<CampusLifeEventFieldsFragment[], Error>;
}): React.JSX.Element {
	const { styles } = useStyles(stylesheet);
	const { t } = useTranslation('common');

	const {
		isRefetchingByUser: isRefetchingByUserClEvents,
		refetchByUser: refetchByUserClEvents
	} = useRefreshByUser(clEventsResult.refetch);

	const scrollY = new Animated.Value(0);
	return (
		<ScrollView
			contentContainerStyle={styles.itemsContainer}
			onScroll={Animated.event(
				[
					{
						nativeEvent: {
							contentOffset: { y: scrollY }
						}
					}
				],
				{ useNativeDriver: false }
			)}
			scrollEventThrottle={16}
			refreshControl={
				<RefreshControl
					refreshing={isRefetchingByUserClEvents}
					onRefresh={() => {
						void refetchByUserClEvents();
					}}
				/>
			}
		>
			{clEventsResult.isLoading ? (
				<LoadingIndicator />
			) : clEventsResult.isError ? (
				<ErrorView
					title={clEventsResult.error?.message ?? t('error.title')}
					onButtonPress={() => {
						void refetchByUserClEvents();
					}}
					inModal
				/>
			) : clEventsResult.isPaused && !clEventsResult.isSuccess ? (
				<ErrorView title={networkError} inModal />
			) : (
				<View style={styles.contentBorder}>
					{clEventsResult.data != null && clEventsResult.data.length > 0 ? (
						<View style={styles.contentBorder}>
							{clEventsResult.data?.map((event, index) => (
								<React.Fragment key={index}>
									<CLEventRow event={event} />
									{index !== clEventsResult.data.length - 1 && (
										<Divider iosPaddingLeft={16} />
									)}
								</React.Fragment>
							))}
						</View>
					) : (
						<ErrorView
							title={t('pages.clEvents.events.noEvents.title')}
							message={t('pages.clEvents.events.noEvents.subtitle')}
							icon={{
								ios: 'calendar.badge.clock',
								android: 'calendar_clock',
								web: 'CalendarClock'
							}}
							inModal
							isCritical={false}
						/>
					)}
				</View>
			)}
		</ScrollView>
	);
}

const stylesheet = createStyleSheet((theme) => ({
	contentBorder: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md
	},
	itemsContainer: {
		alignSelf: 'center',
		justifyContent: 'center',
		paddingBottom: theme.margins.bottomSafeArea,
		paddingHorizontal: theme.margins.page,
		width: '100%'
	}
}));
