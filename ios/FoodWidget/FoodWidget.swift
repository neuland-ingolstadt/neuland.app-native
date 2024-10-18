//
//  FoodWidget.swift
//  FoodWidget
//
//  Created by Robert Eggl on 16.10.24.
//

import WidgetKit
import SwiftUI


struct MockData {
  static let meals: [Meal] = [
    Meal(
      id: "14c208b1",
      name: Name(de: "Brokkolisuppe", en: "Broccoli soup"),
      category: .soup,
      prices: Prices(student: 0.9, employee: 0.95, guest: 1.1),
      allergens: ["Sel", "Veg"],
      flags: [],
      nutrition: Nutrition(kj: 458, kcal: 109, fat: 4.8, fatSaturated: 2.7, carbs: 12.4, sugar: 7.9, fiber: 1.7, protein: 2.8, salt: 2.9),
      variants: [],
      originalLanguage: .de,
      mealStatic: false,
      restaurant: .ingolstadtMensa
    ),
    Meal(
      id: "145fa614",
      name: Name(de: "Grießbrei mit Zimt und Zucker und Kirschkompott", en: "Semolina porridge with cinnamon and sugar and cherry compote"),
      category: .main,
      prices: Prices(student: 2.17, employee: 4.13, guest: 4.34),
      allergens: ["Mi", "Wz"],
      flags: ["V"],
      nutrition: Nutrition(kj: 3384, kcal: 808, fat: 35.5, fatSaturated: 23.6, carbs: 101.8, sugar: 63.4, fiber: 1, protein: 18.6, salt: 1.1),
      variants: [],
      originalLanguage: .de,
      mealStatic: false,
      restaurant: .ingolstadtMensa
    ),
    Meal(
      id: "145fa614",
      name: Name(de: "Grießbrei mit Zimt und Zucker und Kirschkompott", en: "Semolina porridge with cinnamon and sugar and cherry compote"),
      category: .main,
      prices: Prices(student: 2.17, employee: 4.13, guest: 4.34),
      allergens: ["Mi", "Wz"],
      flags: ["V"],
      nutrition: Nutrition(kj: 3384, kcal: 808, fat: 35.5, fatSaturated: 23.6, carbs: 101.8, sugar: 63.4, fiber: 1, protein: 18.6, salt: 1.1),
      variants: [],
      originalLanguage: .de,
      mealStatic: false,
      restaurant: .ingolstadtMensa
    ),
    
    // Add more mock meals as needed
  ]
}

import WidgetKit
import SwiftUI

struct MealProvider: TimelineProvider {
  func placeholder(in context: Context) -> MealEntry {
    MealEntry(date: Date(), meals: [], error: nil)
  }
  
  func getSnapshot(in context: Context, completion: @escaping (MealEntry) -> ()) {
    let entry = MealEntry(date: Date(), meals: MockData.meals, error: nil) // Use mock data for the snapshot
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<MealEntry>) -> ()) {
    let operation = GraphQLOperation.fetchFood(locations: ["ingolstadtMensa"])
    
    performOperation(operation) { result in
      var timelineEntries: [MealEntry] = []
      let currentDate = Date()
      
      switch result {
      case .success(let food):
        let filteredFood = filterMealsForToday(food)
        
        if !filteredFood.foodData.isEmpty {
          let todayMeals = filteredFood.foodData.flatMap { $0.meals }

          let mealEntry = MealEntry(date: currentDate, meals: todayMeals, error: nil)
          timelineEntries.append(mealEntry)
        } else {
          let fallbackEntry = MealEntry(date: currentDate, meals: [], error: "No meals available for today.")
          timelineEntries.append(fallbackEntry)
        }
      case .failure(let error):
        print("Error fetching meals: \(error.localizedDescription)")
        
        // Create an entry with the error message
        let fallbackEntry = MealEntry(date: Date(), meals: [], error: "Failed to load meals. Please try again later.")
        timelineEntries.append(fallbackEntry)
      }
      
      let timeline = Timeline(entries: timelineEntries, policy: .atEnd)
      completion(timeline)
    }
  }



}

struct MealEntry: TimelineEntry {
  let date: Date
  let meals: [Meal]
  let error: String?
}

struct FoodWidgetEntryView: View {
  var entry: MealEntry
  
  var body: some View {
    if let errorMessage = entry.error {
      // Display the error message
      Text(errorMessage)
        .font(.headline)
        .foregroundColor(.red)
        .multilineTextAlignment(.center)
        .padding()
    } else {
      // Normal meal display
      VStack(alignment: .leading, spacing: 3) {
        Text("Meals")
          .font(.headline)
        
        ForEach(entry.meals.prefix(3), id: \.id) { meal in
          VStack(alignment: .leading, spacing: 2) {
            Text(meal.name.de)
              .font(.subheadline).fontWeight(.medium).lineLimit(2)
            Text("\(translateRestaurant(meal.restaurant)) • \(meal.prices.student, specifier: "%.2f") €")
              .font(.caption)
          }
        }
      }
    }
  }
}


struct FoodWidget: Widget {
  let kind: String = "FoodWidget"
  
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: MealProvider()) { entry in
      if #available(iOS 17.0, *) {
        FoodWidgetEntryView(entry: entry)
          .containerBackground(.fill.tertiary, for: .widget) // iOS 17+
      } else {
        FoodWidgetEntryView(entry: entry)
          .padding()
          .background(Color(.systemBackground)) // Fallback for earlier versions
      }
    }
    .configurationDisplayName("Food Widget")
    .description("Displays meals with prices and categories.")
  }
}

#Preview(as: .systemSmall) {
  FoodWidget()
} timeline: {
  MealEntry(date: .now, meals: MockData.meals, error: nil) // No error
  MealEntry(date: .now, meals: [], error: "Failed to load meals. Please try again later.") // With error
}

