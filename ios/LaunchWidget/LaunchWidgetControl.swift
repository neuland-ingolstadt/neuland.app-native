import AppIntents
import SwiftUI
import WidgetKit

@available(iOS 18.0, *)
struct LaunchWidgetControl: ControlWidget {
  var body: some ControlWidgetConfiguration {
    StaticControlConfiguration(kind: "de.neuland-ingolstadt.neuland-app.LaunchWidgetControl") {
      ControlWidgetButton(action: LaunchWidgetIntent()) {
        Label {
          Text("Open Neuland Next")
        } icon: {
          Image("NeulandSymbol")
           
        }
      }
    }
    .displayName("Neuland Next")
    
  }
}

@available(iOS 18.0, *)
struct LaunchWidgetIntent: ControlConfigurationIntent {
  static let title: LocalizedStringResource = "Launch App"
  static let description = IntentDescription(stringLiteral: "Launch the app!")
  static let isDiscoverable = true
  
  static let openAppWhenRun: Bool = true
  
  @MainActor
  func perform() async throws -> some IntentResult & OpensIntent {    
    let url = URL(string: "neuland://")!
    return .result(opensIntent: OpenURLIntent(url))
  }
}
