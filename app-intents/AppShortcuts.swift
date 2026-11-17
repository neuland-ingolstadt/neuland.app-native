import AppIntents

/// All App Shortcuts for this app. Phrases are compiled into the app and cannot be created
/// at runtime.
///
/// System rules:
/// - Every phrase must include \(.applicationName) or the phrase is dropped at build time.
/// - At most 10 App Shortcuts per app. Apple recommends 2-5.
struct AppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: OpenFoodIntent(),
      phrases: [
        "Open food in \(.applicationName)",
        "Show the menu in \(.applicationName)",
        "Open cafeteria in \(.applicationName)"
      ],
      shortTitle: "Food",
      systemImageName: "fork.knife"
    )
    AppShortcut(
      intent: OpenTimetableIntent(),
      phrases: [
        "Open timetable in \(.applicationName)",
        "Open calendar in \(.applicationName)",
        "Show my lectures in \(.applicationName)"
      ],
      shortTitle: "Timetable",
      systemImageName: "calendar"
    )
    AppShortcut(
      intent: OpenMapIntent(),
      phrases: [
        "Open map in \(.applicationName)",
        "Show campus map in \(.applicationName)"
      ],
      shortTitle: "Map",
      systemImageName: "map"
    )
    AppShortcut(
      intent: OpenGradesIntent(),
      phrases: [
        "Open grades in \(.applicationName)",
        "Show my grades in \(.applicationName)"
      ],
      shortTitle: "Grades",
      systemImageName: "graduationcap"
    )
  }
}
