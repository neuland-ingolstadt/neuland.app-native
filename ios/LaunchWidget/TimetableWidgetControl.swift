import AppIntents
import SwiftUI
import WidgetKit

@available(iOS 18.0, *)
struct TimetableWidgetControl: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "de.neuland-ingolstadt.neuland-app.TimetableWidgetControl") {
            ControlWidgetButton(action: TimetableWidgetIntent()) {
                Label {
                    Text(NSLocalizedString("widget.timetable.open", comment: "Button to open timetable"))
                } icon: {
                    Image(systemName: "studentdesk")
                }
            }
        }
        .displayName(LocalizedStringResource("widget.timetable.name", comment: "Timetable widget name"))
    }
}

@available(iOS 18.0, *)
struct TimetableWidgetIntent: ControlConfigurationIntent {
    static let title: LocalizedStringResource = "widget.timetable.title"
    static let isDiscoverable = true
    
    static let openAppWhenRun: Bool = true
    
    @MainActor
    func perform() async throws -> some IntentResult & OpensIntent {    
      let url = URL(string: "neuland://timetable")!
      EnvironmentValues().openURL(url);
      return .result()
    }
}
