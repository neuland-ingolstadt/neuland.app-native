import ExpoModulesCore
import StoreKit
import UIKit

internal class MissingCurrentWindowSceneException: Exception {
	override var reason: String {
		"Cannot determine the current window scene in which to present the App Clip overlay."
	}
}

public class AppClipModule: Module {
	private static let isAppClip: Bool = {
		if let infoPlist = Bundle.main.infoDictionary,
		   infoPlist["NSAppClip"] as? [String: Any] != nil
		{
			return true
		}
		return false
	}()

	public func definition() -> ModuleDefinition {
		Name("AppClip")

		Constant("isAppClip") {
			AppClipModule.isAppClip
		}

		AsyncFunction("prompt") {
			if #available(iOS 16, *) {
				guard
					let currentScene = UIApplication.shared.connectedScenes.first
						as? UIWindowScene
				else {
					throw MissingCurrentWindowSceneException()
				}

				let config = SKOverlay.AppClipConfiguration(position: .bottom)
				let overlay = SKOverlay(configuration: config)
				overlay.present(in: currentScene)
			}
		}.runOnQueue(.main)
	}
}
