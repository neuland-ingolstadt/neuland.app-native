import {
	HStack,
	Image,
	ProgressView,
	Spacer,
	Text,
	VStack
} from '@expo/ui/swift-ui'
import {
	font,
	foregroundStyle,
	frame,
	labelsHidden,
	lineLimit,
	monospacedDigit,
	padding,
	progressViewStyle,
	tint
} from '@expo/ui/swift-ui/modifiers'
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets'
import type { LectureLiveActivityProps } from '@/types/lecture-live-activity'

const LectureLiveActivity = (
	props: LectureLiveActivityProps,
	environment: LiveActivityEnvironment
) => {
	'widget'

	const ACCENT = environment.isLuminanceReduced ? '#FFFFFF' : '#3B82F6'
	const SECONDARY = environment.isLuminanceReduced ? '#FFFFFF99' : '#A1A1AA'
	const startDate = new Date(props.startEpochMs)
	const endDate = new Date(props.endEpochMs)
	const syncDate = new Date(props.syncEpochMs ?? props.startEpochMs)
	const isOngoing = props.phase === 'ongoing'
	const isDone = props.phase === 'done'
	const room = props.room ?? ''
	const title = props.title ?? 'Lecture'
	const statusLabel = props.statusLabel ?? ''
	const timeLabel = props.timeLabel ?? ''
	const countdownLabel = props.countdownLabel ?? ''

	const Countdown = ({ size, width }: { size: number; width: number }) => {
		if (isDone) {
			return (
				<Text
					modifiers={[
						font({ weight: 'semibold', size }),
						foregroundStyle(SECONDARY),
						monospacedDigit()
					]}
				>
					{countdownLabel}
				</Text>
			)
		}

		return (
			<Text
				timerInterval={{
					lower: isOngoing ? startDate : syncDate,
					upper: isOngoing ? endDate : startDate
				}}
				countsDown
				modifiers={[
					font({ weight: 'bold', size }),
					foregroundStyle(ACCENT),
					monospacedDigit(),
					frame({ width })
				]}
			/>
		)
	}

	return {
		banner: (
			<VStack
				alignment="leading"
				spacing={8}
				modifiers={[padding({ all: 14 })]}
			>
				<HStack spacing={10} alignment="center">
					<Image systemName="book.fill" color={ACCENT} size={18} />
					<VStack alignment="leading" spacing={2}>
						<Text
							modifiers={[
								font({ weight: 'semibold', size: 15 }),
								foregroundStyle('#FFFFFF'),
								lineLimit(2)
							]}
						>
							{title}
						</Text>
						{room !== '' ? (
							<Text
								modifiers={[
									font({ size: 13 }),
									foregroundStyle(SECONDARY),
									lineLimit(1)
								]}
							>
								{room}
							</Text>
						) : null}
					</VStack>
					<Spacer />
					<VStack alignment="trailing" spacing={2}>
						<Countdown size={20} width={72} />
						{countdownLabel !== '' ? (
							<Text
								modifiers={[
									font({ size: 11 }),
									foregroundStyle(SECONDARY),
									lineLimit(1)
								]}
							>
								{countdownLabel}
							</Text>
						) : null}
					</VStack>
				</HStack>

				{isOngoing ? (
					<ProgressView
						timerInterval={{ lower: startDate, upper: endDate }}
						countsDown={false}
						modifiers={[
							progressViewStyle('linear'),
							tint(ACCENT),
							labelsHidden(),
							frame({ maxWidth: Number.POSITIVE_INFINITY })
						]}
					/>
				) : null}

				<HStack>
					<Text modifiers={[font({ size: 12 }), foregroundStyle(SECONDARY)]}>
						{timeLabel}
					</Text>
					<Spacer />
					<Text modifiers={[font({ size: 12 }), foregroundStyle(SECONDARY)]}>
						{statusLabel}
					</Text>
				</HStack>
			</VStack>
		),
		compactLeading: <Image systemName="book.fill" color={ACCENT} size={16} />,
		compactTrailing: <Countdown size={14} width={48} />,
		minimal: <Image systemName="book.fill" color={ACCENT} size={14} />,
		expandedLeading: (
			<VStack alignment="leading" spacing={4} modifiers={[padding({ all: 8 })]}>
				<Image systemName="book.fill" color={ACCENT} size={20} />
				{room !== '' ? (
					<Text
						modifiers={[
							font({ size: 12 }),
							foregroundStyle(SECONDARY),
							lineLimit(1)
						]}
					>
						{room}
					</Text>
				) : null}
			</VStack>
		),
		expandedTrailing: (
			<VStack
				alignment="trailing"
				spacing={2}
				modifiers={[padding({ all: 8 })]}
			>
				<Countdown size={22} width={72} />
				{countdownLabel !== '' ? (
					<Text modifiers={[font({ size: 11 }), foregroundStyle(SECONDARY)]}>
						{countdownLabel}
					</Text>
				) : null}
			</VStack>
		),
		expandedBottom: (
			<VStack
				alignment="leading"
				spacing={6}
				modifiers={[padding({ all: 10 })]}
			>
				<Text
					modifiers={[
						font({ weight: 'semibold', size: 15 }),
						foregroundStyle('#FFFFFF'),
						lineLimit(2)
					]}
				>
					{title}
				</Text>
				{isOngoing ? (
					<ProgressView
						timerInterval={{ lower: startDate, upper: endDate }}
						countsDown={false}
						modifiers={[
							progressViewStyle('linear'),
							tint(ACCENT),
							labelsHidden(),
							frame({ maxWidth: Number.POSITIVE_INFINITY })
						]}
					/>
				) : null}
				<HStack>
					<Text modifiers={[font({ size: 12 }), foregroundStyle(SECONDARY)]}>
						{timeLabel}
					</Text>
					<Spacer />
					<Text modifiers={[font({ size: 12 }), foregroundStyle(SECONDARY)]}>
						{statusLabel}
					</Text>
				</HStack>
			</VStack>
		)
	}
}

export default createLiveActivity('LectureLiveActivity', LectureLiveActivity)
