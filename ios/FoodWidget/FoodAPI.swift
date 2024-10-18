import Foundation

// GraphQL response handling
struct GraphQLResult<T: Decodable>: Decodable {
  let object: T?
  let errorMessages: [String]
  
  enum CodingKeys: String, CodingKey {
    case data
    case errors
  }
  
  struct Error: Decodable {
    let location: String
    let message: String
  }
  
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    
    let dataDict = try container.decodeIfPresent([String: T].self, forKey: .data)
    self.object = dataDict?.values.first
    
    var errorMessages: [String] = []
    
    let errors = try container.decodeIfPresent([Error].self, forKey: .errors)
    if let errors = errors {
      errorMessages.append(contentsOf: errors.map { $0.message })
    }
    
    self.errorMessages = errorMessages
  }
}

// Input structure for GraphQL operations
struct FoodInput: Encodable {
  let locations: [String] // Include locations
}

// GraphQL operation structure
struct GraphQLOperation<Input: Encodable, Output: Decodable>: Encodable {
  var input: Input
  var operationString: String
  
  private let url = URL(string: "https://api.neuland.app/graphql")!
  
  enum CodingKeys: String, CodingKey {
    case variables
    case query
  }
  
  func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: CodingKeys.self)
    try container.encode(input, forKey: .variables)
    try container.encode(operationString, forKey: .query)
  }
  
  func getURLRequest() throws -> URLRequest {
    var request = URLRequest(url: url)
    
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(self)
    
    return request
  }
}

// Creating the operation for fetching food with a location
extension GraphQLOperation where Input == FoodInput, Output == Food {
  static func fetchFood(locations: [String]) -> Self {
    let locationsString = locations.map { "\"\($0)\"" }.joined(separator: ",")
    
    let query = """
        query {
            food(locations: [\(locationsString)]) {
                foodData {
                    timestamp
                    meals {
                        id
                        name {
                            de
                            en
                        }
                        category
                        prices {
                            student
                            employee
                            guest
                        }
                        allergens
                        flags
                        nutrition {
                            kj
                            kcal
                            fat
                            fatSaturated
                            carbs
                            sugar
                            fiber
                            protein
                            salt
                        }
                        variants {
                            id
                            name {
                                de
                                en
                            }
                            additional
                            allergens
                            flags
                            originalLanguage
                            static
                            restaurant
                            parent {
                                id
                                category
                            }
                            prices {
                                student
                                employee
                                guest
                            }
                        }
                        originalLanguage
                        static
                        restaurant
                    }
                }
                errors {
                    location
                    message
                }
            }
        }
        """
    
    return GraphQLOperation(
      input: FoodInput(locations: locations),
      operationString: query
    )
  }
}

func filterMealsForToday(_ food: Food) -> Food {
  let today = Calendar.current.startOfDay(for: Date())  // Get today's date without time
  let dateFormatter = DateFormatter()
  dateFormatter.dateFormat = "yyyy-MM-dd"  // Adjust format to match your timestamp format
  
  let filteredFoodData: [FoodDatum] = food.foodData.compactMap { foodDatum in
    // Parse the timestamp to get the meal's date
    guard let mealDate = dateFormatter.date(from: foodDatum.timestamp) else {
      return nil  // Skip this datum if the date parsing fails
    }
    
    let mealStartOfDay = Calendar.current.startOfDay(for: mealDate)  // Remove time component
    
    // Filter the meals if the date matches today's date
    if mealStartOfDay == today {
      // Filter only meals in the "main" category
      let mainMeals = foodDatum.meals.filter { $0.category == .main  && !$0.mealStatic}
      
      if !mainMeals.isEmpty {
        // Return a new FoodDatum with only the main meals
        return FoodDatum(timestamp: foodDatum.timestamp, meals: mainMeals)
      }
    }
    
    return nil  // Discard any data not from today or without "main" category meals
  }
  
  return Food(foodData: filteredFoodData, errors: food.errors)
}

func translateRestaurant(_ restaurant: Restaurant) -> String {
    switch restaurant {
    case .ingolstadtMensa:
        return "Mensa Ing"
    case .neuburgMensa:
        return "Mensa Nbg"
    case .reimanns:
        return "Reimanns"
    case .canisius:
        return "Canisius"
    }
}


// Perform the GraphQL operation with @Sendable
func performOperation<Input, Output>(_ operation: GraphQLOperation<Input, Output>,
                                     completion: @escaping @Sendable (Result<Output, Swift.Error>) -> Void) {
  let request: URLRequest
  
  do {
    request = try operation.getURLRequest()
  } catch {
    completion(.failure(error))
    return
  }
  
  URLSession.shared.dataTask(with: request) { (data, _, error) in
    if let error = error {
      completion(.failure(error))
      return
    }
    
    guard let data = data else {
      completion(.failure(NSError(domain: "No data", code: 0)))
      return
    }
    
    let responseString = String(data: data, encoding: .utf8) ?? "Unable to convert response data to string"
    print("Response data: \(responseString)") // Log the response
    
    do {
      let result = try JSONDecoder().decode(GraphQLResult<Output>.self, from: data)
      if let object = result.object {
        let filteredObject = filterMealsForToday(object as! Food)
        print(filteredObject)
        completion(.success(filteredObject as! Output))
      } else {
        print(result.errorMessages.joined(separator: "\n"))
        completion(.failure(NSError(domain: "Server error", code: 1)))
      }
    } catch {
      completion(.failure(error))
    }
    
  }.resume()
}
