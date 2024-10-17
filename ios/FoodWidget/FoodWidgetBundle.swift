//
//  FoodWidgetBundle.swift
//  FoodWidget
//
//  Created by Robert Eggl on 16.10.24.
//

import WidgetKit
import SwiftUI

@main
struct FoodWidgetBundle: WidgetBundle {
    var body: some Widget {
        FoodWidget()
        FoodWidgetControl()
    }
}
