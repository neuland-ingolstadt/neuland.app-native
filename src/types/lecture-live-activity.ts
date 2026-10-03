export type LectureLiveActivityPhase = 'upcoming' | 'ongoing' | 'done'

export type LectureLiveActivityProps = {
	eventId: string
	title: string
	room: string
	phase: LectureLiveActivityPhase
	/** Epoch ms — JSON-safe across the widget bridge */
	startEpochMs: number
	endEpochMs: number
	/** Epoch ms of the last app sync — used as countdown lower bound while upcoming */
	syncEpochMs: number
	/** Pre-localized status line from the app */
	statusLabel: string
	/** e.g. "08:15 – 09:45" */
	timeLabel: string
	/** Short label under the countdown, e.g. "left" / "until start" */
	countdownLabel: string
}
