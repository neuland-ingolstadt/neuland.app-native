import AppIntents
internal import ExpoAppIntents

/// Opens the grades screen.
struct OpenGradesIntent: AppIntent {
  static let title: LocalizedStringResource = "Open Grades"
  static let description = IntentDescription("Shows your exam grades.")
  static let openAppWhenRun = true

  @MainActor
  func perform() async throws -> some IntentResult & ProvidesDialog {
    await AppIntentDispatcher.shared.dispatch(name: "openGrades")
    return .result(dialog: "Opening Grades.")
  }
}
