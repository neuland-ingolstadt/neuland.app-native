import { MapContext } from '@/contexts/map';
import { USER_GUEST } from '@/data/constants';
import { SEARCH_TYPES } from '@/types/map';
import { formatFriendlyTime } from '@/utils/date-utils';
import { getContrastColor, roomNotFoundToast } from '@/utils/ui-utils';
import { trackEvent } from '@aptabase/react-native';
import { router } from 'expo-router';
import type { FeatureCollection } from 'geojson';
import type { Position } from 'geojson';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import Divider from '../Universal/Divider';
import PlatformIcon from '../Universal/Icon';
import LoadingIndicator from '../Universal/LoadingIndicator';
import { UserKindContext } from '../contexts';

interface AvailableRoomsSuggestionsProps {
	allRooms: FeatureCollection;
	handlePresentModalPress: () => void;
}

const AvailableRoomsSuggestions: React.FC<AvailableRoomsSuggestionsProps> = ({
	allRooms,
	handlePresentModalPress
}) => {
	const { styles, theme } = useStyles(stylesheet);
	const { t } = useTranslation('common');
	const { userKind = USER_GUEST } = useContext(UserKindContext);
	const {
		setClickedElement,
		availableRooms,

		setCurrentFloor
	} = useContext(MapContext);
	return (
		<View>
			<View style={styles.suggestionSectionHeaderContainer}>
				<Text style={styles.suggestionSectionHeader}>
					{t('pages.map.details.room.availableRooms')}
				</Text>
				{userKind !== USER_GUEST && (
					<Pressable
						onPress={() => {
							router.navigate('/room-search');
						}}
						hitSlop={{
							bottom: 10,
							left: 10,
							right: 10,
							top: 10
						}}
						style={styles.suggestionMoreButton}
					>
						<Text style={styles.suggestionMoreButtonText}>
							{t('misc.more')}
						</Text>
					</Pressable>
				)}
			</View>
			<Pressable
				style={styles.radiusBg}
				onPress={() => {
					router.navigate('/login');
				}}
				disabled={userKind !== USER_GUEST}
			>
				{userKind === USER_GUEST ? (
					<Text style={styles.noResults}>
						{t('pages.map.details.room.signIn')}
					</Text>
				) : availableRooms === null ? (
					<LoadingIndicator style={styles.loadingMargin} />
				) : availableRooms.length === 0 ? (
					<Text style={styles.noResults}>
						{t('pages.map.noAvailableRooms')}
					</Text>
				) : (
					(() => {
						const roomSuggestions = availableRooms.slice(0, 3);
						return roomSuggestions.map((room, key) => (
							<React.Fragment key={key}>
								<Pressable
									style={styles.suggestionRow}
									onPress={() => {
										const details = allRooms.features.find(
											(x) => x.properties?.Raum === room.room
										);

										if (details == null) {
											roomNotFoundToast(room.room, theme.colors.notification);
											return;
										}

										const etage = details?.properties?.Ebene as
											| string
											| undefined;

										setCurrentFloor({
											floor: etage ?? 'EG',
											manual: false
										});
										setClickedElement({
											data: room.room,
											type: SEARCH_TYPES.ROOM,
											center: details?.properties?.center as
												| Position
												| undefined,
											manual: false
										});
										trackEvent('Room', {
											room: room.room,
											origin: 'AvailableRoomsSuggestion'
										});

										handlePresentModalPress();
									}}
								>
									<View style={styles.suggestionInnerRow}>
										<View style={styles.suggestionIconContainer}>
											<PlatformIcon
												ios={{
													name: 'studentdesk',
													size: 18
												}}
												android={{
													name: 'school',
													size: 20
												}}
												web={{
													name: 'Notebook',
													size: 20
												}}
												style={styles.primaryContrast}
											/>
										</View>

										<View style={styles.suggestionContent}>
											<Text style={styles.suggestionTitle}>{room.room}</Text>
											<Text style={styles.suggestionSubtitle}>
												<>
													{room.type}
													{room.capacity !== undefined && (
														<>
															{' '}
															({room.capacity} {t('pages.rooms.options.seats')})
														</>
													)}
												</>
											</Text>
										</View>
									</View>
									<View style={styles.suggestionRightContainer}>
										<Text style={styles.timeLabel}>
											{formatFriendlyTime(room.from)}
										</Text>
										<Text style={styles.time}>
											{formatFriendlyTime(room.until)}
										</Text>
									</View>
								</Pressable>
								{roomSuggestions.length > 1 &&
									key < roomSuggestions.length - 1 && <Divider />}
							</React.Fragment>
						));
					})()
				)}
			</Pressable>
		</View>
	);
};

const stylesheet = createStyleSheet((theme) => ({
	loadingMargin: {
		marginVertical: 30
	},
	noResults: {
		color: theme.colors.text,
		fontSize: 16,
		paddingVertical: 30,
		textAlign: 'center'
	},
	primaryContrast: {
		color: getContrastColor(theme.colors.primary)
	},
	radiusBg: {
		backgroundColor: theme.colors.card,
		borderRadius: 14,
		overflow: 'hidden'
	},
	suggestionContent: {
		flex: 1,
		paddingRight: 14
	},
	suggestionIconContainer: {
		alignItems: 'center',
		backgroundColor: theme.colors.primary,
		borderRadius: 50,
		height: 40,
		justifyContent: 'center',
		marginRight: 14,
		width: 40
	},
	suggestionInnerRow: {
		alignItems: 'center',
		flexDirection: 'row',
		flex: 1,
		justifyContent: 'space-between'
	},
	suggestionMoreButton: {
		flexShrink: 1
	},
	suggestionMoreButtonText: {
		color: theme.colors.primary,
		fontSize: 16,
		fontWeight: '500',
		paddingRight: 10,
		textAlign: 'right'
	},
	suggestionRightContainer: {
		flexDirection: 'column',
		justifyContent: 'center'
	},
	suggestionRow: {
		flexDirection: 'row',
		paddingHorizontal: 12,
		paddingVertical: 14
	},
	suggestionSectionHeader: {
		color: theme.colors.text,
		fontSize: 20,
		fontWeight: '600',
		marginBottom: 2,
		paddingTop: 8,
		textAlign: 'left'
	},
	suggestionSectionHeaderContainer: {
		alignItems: 'flex-end',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4
	},
	suggestionSubtitle: {
		color: theme.colors.text,
		fontSize: 14,
		fontWeight: '400'
	},
	suggestionTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 1
	},
	time: {
		color: theme.colors.text,
		fontVariant: ['tabular-nums']
	},
	timeLabel: {
		color: theme.colors.labelColor,
		fontVariant: ['tabular-nums']
	}
}));

export default AvailableRoomsSuggestions;
