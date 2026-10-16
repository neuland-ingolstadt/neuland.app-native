/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** Enum representing the original language of a meal. */
export type OriginalLanguage =
  /** German language code */
  | 'de'
  /** English language code */
  | 'en';

export type FoodPlanQueryVariables = Exact<{
  locations: Array<unknown> | unknown;
}>;


export type FoodPlanQuery = { food: { ' $fragmentRefs'?: { 'FoodFieldsFragment': FoodFieldsFragment } } };

export type FoodFieldsFragment = { foodData: Array<{ timestamp: string, meals: Array<{ id: string, category: string, allergens: Array<string | null> | null, flags: Array<string | null> | null, originalLanguage: OriginalLanguage, static: boolean, restaurant: string, name: { de: string | null, en: string | null }, prices: { student: number | null, employee: number | null, guest: number | null }, nutrition: { kj: number, kcal: number, fat: number, fatSaturated: number, carbs: number, sugar: number, fiber: number, protein: number, salt: number } | null, variants: Array<{ additional: boolean, id: string, allergens: Array<string | null> | null, flags: Array<string | null> | null, originalLanguage: OriginalLanguage, static: boolean, restaurant: string | null, name: { de: string | null, en: string | null }, parent: { id: string, category: string } | null, prices: { student: number | null, employee: number | null, guest: number | null } }> | null }> | null }> | null, errors: Array<{ location: string, message: string }> | null } & { ' $fragmentName'?: 'FoodFieldsFragment' };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const FoodFieldsFragmentDoc = new TypedDocumentString(`
    fragment FoodFields on FoodResponse {
  foodData {
    timestamp
    meals {
      name {
        de
        en
      }
      id
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
        name {
          de
          en
        }
        additional
        id
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
    `, {"fragmentName":"FoodFields"}) as unknown as TypedDocumentString<FoodFieldsFragment, unknown>;
export const FoodPlanDocument = new TypedDocumentString(`
    query FoodPlan($locations: [LocationInput!]!) {
  food(locations: $locations) {
    ...FoodFields
  }
}
    fragment FoodFields on FoodResponse {
  foodData {
    timestamp
    meals {
      name {
        de
        en
      }
      id
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
        name {
          de
          en
        }
        additional
        id
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
}`) as unknown as TypedDocumentString<FoodPlanQuery, FoodPlanQueryVariables>;