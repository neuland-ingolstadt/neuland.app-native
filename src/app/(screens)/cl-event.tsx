import FormList from '@/components/Universal/FormList';
import { linkIcon } from '@/components/Universal/Icon';
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton';
import useCLParamsStore from '@/hooks/useCLParamsStore';
import type { LanguageKey } from '@/localization/i18n';
import type { FormListSections, SectionGroup } from '@/types/components';
import {
	formatFriendlyDateTime,
	formatFriendlyDateTimeRange
} from '@/utils/date-utils';
import { isValidRoom } from '@/utils/timetable-utils';
import { trackEvent } from '@aptabase/react-native';
import { HeaderTitle } from '@react-navigation/elements';
import {
	Redirect,
	Stack,
	router,
	useFocusEffect,
	useNavigation
} from 'expo-router';
import type React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Share, Text, View } from 'react-native';
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

export default function ClEventDetail(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet);
	const clEvent = useCLParamsStore((state) => state.selectedClEvent);

	const ref = useAnimatedRef<Animated.ScrollView>();
	const scroll = useScrollViewOffset(ref);
	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scroll.value,
						[0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		};
	});
	const { t, i18n } = useTranslation('common');
	const isMultiDayEvent =
		clEvent?.startDateTime != null &&
		clEvent.endDateTime != null &&
		new Date(clEvent.startDateTime).toDateString() !==
			new Date(clEvent.endDateTime).toDateString();

	const isWebsiteAvailable = clEvent?.host.website != null;
	const isInstagramAvailable = clEvent?.host.instagram != null;

	const dateRange = formatFriendlyDateTimeRange(
		clEvent?.startDateTime != null ? new Date(clEvent.startDateTime) : null,
		clEvent?.endDateTime != null ? new Date(clEvent.endDateTime) : null
	);
	const navigation = useNavigation();

	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				headerRight: () => (
					<ShareHeaderButton
						onPress={async () => {
							trackEvent('Share', {
								type: 'clEvent'
							});
							await Share.share({
								message: t('pages.event.shareMessage', {
									title: clEvent?.titles[i18n.language as LanguageKey],
									organizer: clEvent?.host.name,
									date: dateRange
								})
							});
						}}
					/>
				)
			});
		}, [])
	);

	const sections: FormListSections[] = [
		{
			header: 'Details',
			items: [
				...(!isMultiDayEvent
					? [
							{
								title: t('pages.event.date'),
								value: dateRange
							}
						]
					: [
							// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
							...(clEvent.startDateTime != null
								? [
										{
											title: t('pages.event.begin'),
											value:
												formatFriendlyDateTime(
													new Date(clEvent.startDateTime)
												) ?? undefined
										}
									]
								: []),
							...(clEvent.endDateTime != null
								? [
										{
											title: t('pages.event.end'),
											value:
												formatFriendlyDateTime(new Date(clEvent.endDateTime)) ??
												undefined
										}
									]
								: [])
						]),
				...(clEvent?.location != null && clEvent.location !== ''
					? [
							Object.assign(
								{
									title: t('pages.event.location'),
									value: clEvent?.location
								},
								isValidRoom(clEvent.location)
									? {
											onPress: () => {
												router.dismissTo({
													pathname: '/map',
													params: {
														room: clEvent?.location
													}
												});
											},
											textColor: theme.colors.primary
										}
									: {}
							)
						]
					: []),

				{
					title: t('pages.event.organizer'),
					value: clEvent?.host.name
				}
			]
		},
		...(isWebsiteAvailable || isInstagramAvailable
			? [
					{
						header: 'Links',
						items: [
							isWebsiteAvailable
								? {
										title: 'Website',
										icon: linkIcon,
										onPress: () => {
											void Linking.openURL(clEvent.host.website);
										}
									}
								: null,
							isInstagramAvailable
								? {
										title: 'Instagram',
										icon: {
											ios: 'instagram',
											android: 'instagram',
											web: 'Instagram',
											iosFallback: true
										},
										onPress: () => {
											void Linking.openURL(clEvent.host.instagram);
										}
									}
								: null
						].filter((item) => item != null) as SectionGroup[]
					}
				]
			: []),
		...(clEvent?.descriptions != null
			? [
					{
						header: t('pages.event.description'),
						item: clEvent.descriptions[i18n.language as LanguageKey]
					}
				]
			: [])
	];

	if (clEvent == null) {
		return <Redirect href={'/cl-events'} />;
	}
	return (
		<Animated.ScrollView
			style={styles.page}
			contentContainerStyle={styles.container}
			ref={ref}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View style={styles.headerTitle}>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={theme.colors.text}>
									{clEvent.titles[i18n.language as LanguageKey]}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>

			<View style={styles.titleContainer}>
				<Text
					style={styles.titleText}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={3}
				>
					{clEvent.titles[i18n.language as LanguageKey]}
				</Text>
			</View>
			<View style={styles.formList}>
				<FormList sections={sections} />
			</View>
		</Animated.ScrollView>
	);
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		gap: 12,
		paddingBottom: theme.margins.modalBottomMargin
	},
	formList: {
		alignSelf: 'center',
		paddingBottom: 12,
		width: '100%'
	},
	headerTitle: {
		marginBottom: Platform.OS === 'ios' ? -10 : 0,
		overflow: 'hidden',
		paddingRight: Platform.OS === 'ios' ? 0 : 50
	},
	page: {
		paddingHorizontal: theme.margins.page
	},
	titleContainer: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	titleText: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 24,
		fontWeight: '600',
		paddingTop: 16,
		textAlign: 'left'
	}
}));
