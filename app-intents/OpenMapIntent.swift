import AppIntents
internal import ExpoAppIntents

/// Opens the campus map tab.
struct OpenMapIntent: AppIntent {
  static let title: LocalizedStringResource = "Open Map"
  static let description = IntentDescription("Shows the campus map.")
  static let openAppWhenRun = true

  @MainActor
  func perform() async throws -> some IntentResult & ProvidesDialog {
    await AppIntentDispatcher.shared.dispatch(name: "openMap")
    return .result(dialog: "Opening Map.")
  }
}
