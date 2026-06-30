import { useQuery } from '@tanstack/react-query'
import React, { use, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { UserKindContext } from '@/components/contexts'
import { Avatar } from '@/components/Settings'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/icon'
import type { UserKindContextType } from '@/contexts/userKind'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import type { MaterialIcon } from '@/types/material-icons'
import { getPersonalData } from '@/utils/api-utils'
import { loadSecureAsync } from '@/utils/storage'
import { getInitials } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

interface IndexHeaderRightProps {
	color?: string
	size?: number
	focused?: boolean
}

export const SettingsTabButton = ({
	color,
	size = 24,
	focused = false
}: IndexHeaderRightProps): React.JSX.Element => {
	const { t } = useTranslation(['navigation', 'settings'])
	const { userKind = USER_GUEST } = use<UserKindContextType>(UserKindContext)
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelColor = toColor(useCSSVariable('--color-label'))
	const tabbarInactiveColor = toColor(useCSSVariable('--color-tabbar-inactive'))
	const contrastColor = toColor(useCSSVariable('--color-contrast'))

	const [username, setUsername] = useState<string>('')
	const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
	const [initials, setInitials] = useState('')

	const iconColor = color || textColor

	useEffect(() => {
		const loadUsername = async (): Promise<void> => {
			if (userKind === USER_EMPLOYEE) {
				const loadedUsername = await loadSecureAsync('username')
				setUsername(loadedUsername ?? '')
			}
		}
		void loadUsername()
	}, [userKind])

	const {
		data: persData,
		isError,
		isSuccess
	} = useQuery({
		queryKey: ['personalData'],
		queryFn: async () => {
			setShowLoadingIndicator(true)
			const data = await getPersonalData()
			setShowLoadingIndicator(false)
			return data
		},
		staleTime: 1000 * 60 * 60 * 12, // 12 hours
		gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
		enabled: userKind === USER_STUDENT
	})

	useEffect(() => {
		if (isError) {
			setShowLoadingIndicator(false)
		}
	}, [isError])

	useEffect(() => {
		const fetchUsernameAndSetInitials = async (): Promise<void> => {
			if (userKind === USER_STUDENT && persData !== undefined) {
				const fullName = `${persData.vname} ${persData.name}`
				const initials = getInitials(fullName)
				setInitials(initials)
			} else if (userKind === USER_EMPLOYEE) {
				if (username !== undefined) {
					setInitials(getInitials(username))
				}
			} else {
				setInitials('')
			}
		}
		void fetchUsernameAndSetInitials()
	}, [persData, userKind, username])

	const IconComponent = (): React.JSX.Element => {
		const avatarStyle = focused
			? { backgroundColor: iconColor, borderWidth: 0 }
			: {
					backgroundColor: 'transparent',
					borderWidth: 1.5,
					borderColor: Platform.OS === 'web' ? labelColor : tabbarInactiveColor
				}

		const defaultIconProps = {
			ios: {
				name: focused ? 'person.crop.circle.fill' : 'person.crop.circle',
				size
			},
			android: {
				name: 'account_circle' as MaterialIcon,
				size: size + 2,
				variant: focused ? 'filled' : ('outlined' as 'filled' | 'outlined')
			},
			web: {
				name: 'CircleUserRound' as LucideIcon,
				size
			}
		}
		const defaultUserIcon = (
			<PlatformIcon {...defaultIconProps} style={{ color: iconColor }} />
		)

		const avatarTextColor = focused
			? contrastColor
			: Platform.OS === 'web'
				? labelColor
				: tabbarInactiveColor

		return userKind === USER_EMPLOYEE ? (
			<Avatar size={size} style={avatarStyle}>
				<Text
					className="text-xs font-bold"
					style={{ color: avatarTextColor }}
					numberOfLines={1}
					adjustsFontSizeToFit={true}
				>
					{getInitials((username as string) ?? '')}
				</Text>
			</Avatar>
		) : userKind === USER_GUEST || isError || showLoadingIndicator ? (
			defaultUserIcon
		) : userKind === USER_STUDENT &&
			isSuccess &&
			persData?.mtknr === undefined ? (
			<PlatformIcon
				ios={{
					name: focused
						? 'person.crop.circle.badge.exclamationmark.fill'
						: 'person.crop.circle.badge.exclamationmark',
					size: size
				}}
				android={{
					name: 'account_circle_off',
					size: size + 2
				}}
				web={{
					name: 'UserX',
					size: size
				}}
				style={{ color: iconColor }}
			/>
		) : initials !== '' ? (
			<Avatar size={size} style={avatarStyle}>
				<Text
					className="text-xs font-bold"
					style={{ color: avatarTextColor }}
					numberOfLines={1}
					adjustsFontSizeToFit={true}
				>
					{initials}
				</Text>
			</Avatar>
		) : (
			defaultUserIcon
		)
	}

	const MemoIcon = React.useMemo(
		() => <IconComponent />,
		[
			userKind,
			initials,
			showLoadingIndicator,
			isError,
			isSuccess,
			persData,
			username,
			iconColor,
			labelColor,
			tabbarInactiveColor,
			contrastColor,
			size,
			focused
		]
	)

	return <View accessibilityLabel={t('navigation.settings')}>{MemoIcon}</View>
}
