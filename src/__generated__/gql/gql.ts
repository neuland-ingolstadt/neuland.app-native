/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query FoodPlan($locations: [LocationInput!]!) {\n        food(locations: $locations) {\n            ...FoodFields\n        }\n    }\n": typeof types.FoodPlanDocument,
    "\n    fragment FoodFields on FoodResponse {\n        foodData {\n            timestamp\n            meals {\n                name {\n                    de\n                    en\n                }\n                id\n                category\n                prices {\n                    student\n                    employee\n                    guest\n                }\n                allergens\n                flags\n                nutrition {\n                    kj\n                    kcal\n                    fat\n                    fatSaturated\n                    carbs\n                    sugar\n                    fiber\n                    protein\n                    salt\n                }\n                variants {\n                    name {\n                        de\n                        en\n                    }\n                    additional\n                    id\n                    allergens\n                    flags\n                    originalLanguage\n                    static\n                    restaurant\n                    parent {\n                        id\n                        category\n                    }\n                    prices {\n                        student\n                        employee\n                        guest\n                    }\n                }\n                originalLanguage\n                static\n                restaurant\n            }\n        }\n        errors {\n            location\n            message\n        }\n    }\n": typeof types.FoodFieldsFragmentDoc,
};
const documents: Documents = {
    "\n    query FoodPlan($locations: [LocationInput!]!) {\n        food(locations: $locations) {\n            ...FoodFields\n        }\n    }\n": types.FoodPlanDocument,
    "\n    fragment FoodFields on FoodResponse {\n        foodData {\n            timestamp\n            meals {\n                name {\n                    de\n                    en\n                }\n                id\n                category\n                prices {\n                    student\n                    employee\n                    guest\n                }\n                allergens\n                flags\n                nutrition {\n                    kj\n                    kcal\n                    fat\n                    fatSaturated\n                    carbs\n                    sugar\n                    fiber\n                    protein\n                    salt\n                }\n                variants {\n                    name {\n                        de\n                        en\n                    }\n                    additional\n                    id\n                    allergens\n                    flags\n                    originalLanguage\n                    static\n                    restaurant\n                    parent {\n                        id\n                        category\n                    }\n                    prices {\n                        student\n                        employee\n                        guest\n                    }\n                }\n                originalLanguage\n                static\n                restaurant\n            }\n        }\n        errors {\n            location\n            message\n        }\n    }\n": types.FoodFieldsFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query FoodPlan($locations: [LocationInput!]!) {\n        food(locations: $locations) {\n            ...FoodFields\n        }\n    }\n"): typeof import('./graphql').FoodPlanDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment FoodFields on FoodResponse {\n        foodData {\n            timestamp\n            meals {\n                name {\n                    de\n                    en\n                }\n                id\n                category\n                prices {\n                    student\n                    employee\n                    guest\n                }\n                allergens\n                flags\n                nutrition {\n                    kj\n                    kcal\n                    fat\n                    fatSaturated\n                    carbs\n                    sugar\n                    fiber\n                    protein\n                    salt\n                }\n                variants {\n                    name {\n                        de\n                        en\n                    }\n                    additional\n                    id\n                    allergens\n                    flags\n                    originalLanguage\n                    static\n                    restaurant\n                    parent {\n                        id\n                        category\n                    }\n                    prices {\n                        student\n                        employee\n                        guest\n                    }\n                }\n                originalLanguage\n                static\n                restaurant\n            }\n        }\n        errors {\n            location\n            message\n        }\n    }\n"): typeof import('./graphql').FoodFieldsFragmentDoc;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
