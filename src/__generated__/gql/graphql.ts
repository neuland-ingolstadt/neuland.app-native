/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** Enum representing the different locations of THI. This is used to categorize the sports events. */
export type CampusType =
  | 'Ingolstadt'
  | 'Neuburg';

/** Enum representing the original language of a meal. */
export type OriginalLanguage =
  /** German language code */
  | 'de'
  /** English language code */
  | 'en';

/** Enum representing the platform of the user. This is used to target announcements to specific user groups. */
export type Platform =
  /** Android */
  | 'ANDROID'
  /** iOS */
  | 'IOS'
  /** Web */
  | 'WEB'
  /** Web Development Version */
  | 'WEB_DEV';

/** Enum representing the different room report categories. This is used to categorize the reason for the report. */
export type RoomReportCategory =
  | 'MISSING'
  | 'NOT_EXISTING'
  | 'OTHER'
  | 'WRONG_DESCRIPTION'
  | 'WRONG_LOCATION';

/** Room report input type. Used to create a new report about incorrect room data. */
export type RoomReportInput = {
  /** description of the report */
  description?: string | null | undefined;
  /** Reason for the report. */
  reason: RoomReportCategory;
  /** Room name */
  room: string;
};

/** Enum representing the different sports categories. This is used to categorize the sports events. */
export type SportsCategoryType =
  | 'Badminton'
  | 'Baseball'
  | 'Basketball'
  | 'Boxing'
  | 'Calisthenics'
  | 'Climbing'
  | 'Cycling'
  | 'Dancing'
  | 'Defense'
  | 'Frisbee'
  | 'FullBodyWorkout'
  | 'Handball'
  | 'Hiking'
  | 'Hockey'
  | 'Jogging'
  | 'Kickboxing'
  | 'MartialArts'
  | 'Meditation'
  | 'Other'
  | 'Parkour'
  | 'Rowing'
  | 'Running'
  | 'Skateboarding'
  | 'Soccer'
  | 'Spikeball'
  | 'StrengthTraining'
  | 'Swimming'
  | 'TableTennis'
  | 'Tennis'
  | 'Volleyball'
  | 'Waterpolo'
  | 'Yoga';

/** Enum representing the kind of user. This is used to target announcements to specific user groups. */
export type UserKind =
  /** Employee */
  | 'EMPLOYEE'
  /** Guest */
  | 'GUEST'
  /** Student */
  | 'STUDENT';

/** Enum representing the different weekdays. This is used to categorize the sports events. */
export type WeekdayType =
  | 'Friday'
  | 'Monday'
  | 'Saturday'
  | 'Sunday'
  | 'Thursday'
  | 'Tuesday'
  | 'Wednesday';

export type AppAnnouncementsQueryVariables = Exact<{ [key: string]: never; }>;


export type AppAnnouncementsQuery = { appAnnouncements: Array<{ ' $fragmentRefs'?: { 'AnnouncementFieldsFragment': AnnouncementFieldsFragment } }> };

export type AnnouncementFieldsFragment = { id: string, startDateTime: Date, endDateTime: Date, priority: number, url: string | null, platform: Array<Platform>, userKind: Array<UserKind>, imageUrl: string | null, title: { de: string | null, en: string | null }, description: { de: string | null, en: string | null } } & { ' $fragmentName'?: 'AnnouncementFieldsFragment' };

export type FoodPlanQueryVariables = Exact<{
  locations: Array<unknown> | unknown;
}>;


export type FoodPlanQuery = { food: { ' $fragmentRefs'?: { 'FoodFieldsFragment': FoodFieldsFragment } } };

export type FoodFieldsFragment = { foodData: Array<{ timestamp: string, meals: Array<{ id: string, category: string, allergens: Array<string | null> | null, flags: Array<string | null> | null, originalLanguage: OriginalLanguage, static: boolean, restaurant: string, name: { de: string | null, en: string | null }, prices: { student: number | null, employee: number | null, guest: number | null }, nutrition: { kj: number, kcal: number, fat: number, fatSaturated: number, carbs: number, sugar: number, fiber: number, protein: number, salt: number } | null, variants: Array<{ additional: boolean, id: string, allergens: Array<string | null> | null, flags: Array<string | null> | null, originalLanguage: OriginalLanguage, static: boolean, restaurant: string | null, name: { de: string | null, en: string | null }, parent: { id: string, category: string } | null, prices: { student: number | null, employee: number | null, guest: number | null } }> | null }> | null }> | null, errors: Array<{ location: string, message: string }> | null } & { ' $fragmentName'?: 'FoodFieldsFragment' };

export type UniversitySportsQueryVariables = Exact<{ [key: string]: never; }>;


export type UniversitySportsQuery = { universitySports: Array<{ ' $fragmentRefs'?: { 'UniversitySportsFieldsFragment': UniversitySportsFieldsFragment } }> | null };

export type UniversitySportsFieldsFragment = { id: string, campus: CampusType, location: string, weekday: WeekdayType, startTime: string, endTime: string | null, requiresRegistration: boolean, invitationLink: string | null, eMail: string | null, sportsCategory: SportsCategoryType, title: { de: string | null, en: string | null }, description: { de: string | null, en: string | null } | null } & { ' $fragmentName'?: 'UniversitySportsFieldsFragment' };

export type CreateRoomReportMutationVariables = Exact<{
  input: RoomReportInput;
}>;


export type CreateRoomReportMutation = { createRoomReport: { id: string | null } | null };

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
export const AnnouncementFieldsFragmentDoc = new TypedDocumentString(`
    fragment AnnouncementFields on Announcement {
  id
  title {
    de
    en
  }
  description {
    de
    en
  }
  startDateTime
  endDateTime
  priority
  url
  platform
  userKind
  imageUrl
}
    `, {"fragmentName":"AnnouncementFields"}) as unknown as TypedDocumentString<AnnouncementFieldsFragment, unknown>;
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
export const UniversitySportsFieldsFragmentDoc = new TypedDocumentString(`
    fragment UniversitySportsFields on UniversitySports {
  id
  title {
    de
    en
  }
  description {
    de
    en
  }
  campus
  location
  weekday
  startTime
  endTime
  requiresRegistration
  invitationLink
  eMail
  sportsCategory
}
    `, {"fragmentName":"UniversitySportsFields"}) as unknown as TypedDocumentString<UniversitySportsFieldsFragment, unknown>;
export const AppAnnouncementsDocument = new TypedDocumentString(`
    query AppAnnouncements {
  appAnnouncements(active: true) {
    ...AnnouncementFields
  }
}
    fragment AnnouncementFields on Announcement {
  id
  title {
    de
    en
  }
  description {
    de
    en
  }
  startDateTime
  endDateTime
  priority
  url
  platform
  userKind
  imageUrl
}`) as unknown as TypedDocumentString<AppAnnouncementsQuery, AppAnnouncementsQueryVariables>;
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
export const UniversitySportsDocument = new TypedDocumentString(`
    query UniversitySports {
  universitySports {
    ...UniversitySportsFields
  }
}
    fragment UniversitySportsFields on UniversitySports {
  id
  title {
    de
    en
  }
  description {
    de
    en
  }
  campus
  location
  weekday
  startTime
  endTime
  requiresRegistration
  invitationLink
  eMail
  sportsCategory
}`) as unknown as TypedDocumentString<UniversitySportsQuery, UniversitySportsQueryVariables>;
export const CreateRoomReportDocument = new TypedDocumentString(`
    mutation CreateRoomReport($input: RoomReportInput!) {
  createRoomReport(input: $input) {
    id
  }
}
    `) as unknown as TypedDocumentString<CreateRoomReportMutation, CreateRoomReportMutationVariables>;