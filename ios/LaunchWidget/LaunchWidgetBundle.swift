import WidgetKit
import SwiftUI

@main
struct LaunchWidgetBundle: WidgetBundle {
    var body: some Widget {
        LaunchWidgetControl()
        TimetableWidgetControl()
    }
}
