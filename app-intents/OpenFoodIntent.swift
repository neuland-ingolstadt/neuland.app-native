import AppIntents
internal import ExpoAppIntents

/// Opens the cafeteria menu tab.
struct OpenFoodIntent: AppIntent {
  static let title: LocalizedStringResource = "Open Food"
  static let description = IntentDescription("Shows today's cafeteria menu.")
  static let openAppWhenRun = true

  @MainActor
  func perform() async throws -> some IntentResult & ProvidesDialog {
    await AppIntentDispatcher.shared.dispatch(name: "openFood")
    return .result(dialog: "Opening Food.")
  }
}
