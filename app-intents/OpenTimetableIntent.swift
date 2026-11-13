import AppIntents
internal import ExpoAppIntents

/// Opens the timetable tab.
struct OpenTimetableIntent: AppIntent {
  static let title: LocalizedStringResource = "Open Timetable"
  static let description = IntentDescription("Shows your lecture timetable.")
  static let openAppWhenRun = true

  @MainActor
  func perform() async throws -> some IntentResult & ProvidesDialog {
    await AppIntentDispatcher.shared.dispatch(name: "openTimetable")
    return .result(dialog: "Opening Timetable.")
  }
}
