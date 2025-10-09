import AppIntents
import SwiftUI
import WidgetKit

@available(iOS 18.0, *)
struct LaunchWidgetControl: ControlWidget {
  var body: some ControlWidgetConfiguration {
    StaticControlConfiguration(kind: "de.neuland-ingolstadt.neuland-app.LaunchWidgetControl") {
      ControlWidgetButton(action: LaunchWidgetIntent()) {
        Label {
          Text(NSLocalizedString("widget.launch.open", comment: "Button to open app"))
        } icon: {
          Image("NeulandSymbol")
        }
      }
    }
    .displayName(LocalizedStringResource("widget.launch.name", comment: "Launch widget name"))
  }
}

@available(iOS 18.0, *)
struct LaunchWidgetIntent: ControlConfigurationIntent {
  static let title: LocalizedStringResource = "widget.launch.title"
  static let isDiscoverable = true
  
  static let openAppWhenRun: Bool = true
  
  @MainActor
  func perform() async throws -> some IntentResult & OpensIntent {
    return .result(opensIntent: OpenURLIntent(URL(string: "https://web.neuland.app")!))
  }
}
