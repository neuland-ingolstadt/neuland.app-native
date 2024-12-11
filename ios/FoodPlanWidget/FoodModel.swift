
//
//  Food.swift
//  NeulandNext
//
//  Created by Robert Eggl on 16.10.24.
//


import Foundation

// MARK: - Canteen
struct Canteen: Codable {
  let data: DataClass
}

// MARK: - DataClass
struct DataClass: Codable {
  let food: Food
}

// MARK: - Food
struct Food: Codable {
  let foodData: [FoodDatum]
  let errors: [FoodError]
}

// MARK: - Error
struct FoodError: Codable {
  let location, message: String
}

// MARK: - FoodDatum
struct FoodDatum: Codable {
  let timestamp: String
  let meals: [Meal]
}

// MARK: - Meal
struct Meal: Codable {
  let id: String
  let name: Name
  let category: MealCategory
  let prices: Prices
  let allergens, flags: [String]?
  let nutrition: Nutrition?
  let variants: [Variant]
  let originalLanguage: OriginalLanguage
  let mealStatic: Bool
  let restaurant: Restaurant
  
  enum CodingKeys: String, CodingKey {
    case id, name, category, prices, allergens, flags, nutrition, variants, originalLanguage
    case mealStatic = "static"
    case restaurant
  }
}

enum MealCategory: String, Codable {
  case main = "main"
  case salad = "salad"
  case soup = "soup"
}

// MARK: - Name
struct Name: Codable {
  let de, en: String
}

// MARK: - Nutrition
struct Nutrition: Codable {
  let kj, kcal: Int
  let fat, fatSaturated, carbs, sugar: Double
  let fiber, protein, salt: Double
}

enum OriginalLanguage: String, Codable {
  case de = "de"
}

// MARK: - Prices
struct Prices: Codable {
  let student, employee, guest: Double
}

enum Restaurant: String, Codable {
  case ingolstadtMensa = "IngolstadtMensa"
  case neuburgMensa = "NeuburgMensa"
  case reimanns = "Reimanns"
  case canisius = "Canisius"
}

// MARK: - Variant
struct Variant: Codable {
  let id: String
  let name: Name
  let additional: Bool
  let allergens: [Allergen]?
  let flags: [String]?
  let originalLanguage: OriginalLanguage
  let variantStatic: Bool
  let restaurant: Restaurant
  let parent: Parent
  let prices: Prices
  
  enum CodingKeys: String, CodingKey {
    case id, name, additional, allergens, flags, originalLanguage
    case variantStatic = "static"
    case restaurant, parent, prices
  }
}

enum Allergen: String, Codable {
  case mi = "Mi"
  case sel = "Sel"
  case veg = "Veg"
  case wz = "Wz"
}

// MARK: - Parent
struct Parent: Codable {
  let id: String
  let category: ParentCategory
}

enum ParentCategory: String, Codable {
  case essen = "Essen"
  case salat = "Salat"
  case suppe = "Suppe"
}
