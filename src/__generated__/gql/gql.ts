/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

import * as types from './graphql'

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
const documents = {
    '\n    query AppAnnouncements {\n        appAnnouncements {\n            ...AnnouncementFields\n        }\n    }\n':
        types.AppAnnouncementsDocument,
    '\n    fragment AnnouncementFields on Announcement {\n        id\n        title {\n            de\n            en\n        }\n        description {\n            de\n            en\n        }\n        startDateTime\n        endDateTime\n        priority\n        url\n        platform\n        userKind\n    }\n':
        types.AnnouncementFieldsFragmentDoc,
    '\n    query FoodPlan($locations: [LocationInput!]!) {\n        food(locations: $locations) {\n            ...FoodFields\n        }\n    }\n':
        types.FoodPlanDocument,
    '\n    fragment FoodFields on FoodResponse {\n        foodData {\n            timestamp\n            meals {\n                name {\n                    de\n                    en\n                }\n                id\n                category\n                prices {\n                    student\n                    employee\n                    guest\n                }\n                allergens\n                flags\n                nutrition {\n                    kj\n                    kcal\n                    fat\n                    fatSaturated\n                    carbs\n                    sugar\n                    fiber\n                    protein\n                    salt\n                }\n                variants {\n                    name {\n                        de\n                        en\n                    }\n                    additional\n                    id\n                    allergens\n                    flags\n                    originalLanguage\n                    static\n                    restaurant\n                    parent {\n                        id\n                        category\n                    }\n                    prices {\n                        student\n                        employee\n                        guest\n                    }\n                }\n                originalLanguage\n                static\n                restaurant\n            }\n        }\n        errors {\n            location\n            message\n        }\n    }\n':
        types.FoodFieldsFragmentDoc,
    '\n    query CampusLifeEvents {\n        clEvents {\n            ...CampusLifeEventFields\n        }\n    }\n':
        types.CampusLifeEventsDocument,
    '\n    fragment CampusLifeEventFields on ClEvent {\n        host {\n            name\n            website\n            instagram\n        }\n        titles {\n            de\n            en\n        }\n        startDateTime\n        endDateTime\n        location\n        descriptions {\n            de\n            en\n        }\n    }\n':
        types.CampusLifeEventFieldsFragmentDoc,
    '\n    query UniversitySports {\n        universitySports {\n            ...UniversitySportsFields\n        }\n    }\n':
        types.UniversitySportsDocument,
    '\n    fragment UniversitySportsFields on UniversitySports {\n        id\n        title {\n            de\n            en\n        }\n        description {\n            de\n            en\n        }\n        campus\n        location\n        weekday\n        startTime\n        endTime\n        requiresRegistration\n        invitationLink\n        eMail\n        sportsCategory\n    }\n':
        types.UniversitySportsFieldsFragmentDoc,
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query AppAnnouncements {\n        appAnnouncements {\n            ...AnnouncementFields\n        }\n    }\n'
): (typeof documents)['\n    query AppAnnouncements {\n        appAnnouncements {\n            ...AnnouncementFields\n        }\n    }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment AnnouncementFields on Announcement {\n        id\n        title {\n            de\n            en\n        }\n        description {\n            de\n            en\n        }\n        startDateTime\n        endDateTime\n        priority\n        url\n        platform\n        userKind\n    }\n'
): (typeof documents)['\n    fragment AnnouncementFields on Announcement {\n        id\n        title {\n            de\n            en\n        }\n        description {\n            de\n            en\n        }\n        startDateTime\n        endDateTime\n        priority\n        url\n        platform\n        userKind\n    }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query FoodPlan($locations: [LocationInput!]!) {\n        food(locations: $locations) {\n            ...FoodFields\n        }\n    }\n'
): (typeof documents)['\n    query FoodPlan($locations: [LocationInput!]!) {\n        food(locations: $locations) {\n            ...FoodFields\n        }\n    }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment FoodFields on FoodResponse {\n        foodData {\n            timestamp\n            meals {\n                name {\n                    de\n                    en\n                }\n                id\n                category\n                prices {\n                    student\n                    employee\n                    guest\n                }\n                allergens\n                flags\n                nutrition {\n                    kj\n                    kcal\n                    fat\n                    fatSaturated\n                    carbs\n                    sugar\n                    fiber\n                    protein\n                    salt\n                }\n                variants {\n                    name {\n                        de\n                        en\n                    }\n                    additional\n                    id\n                    allergens\n                    flags\n                    originalLanguage\n                    static\n                    restaurant\n                    parent {\n                        id\n                        category\n                    }\n                    prices {\n                        student\n                        employee\n                        guest\n                    }\n                }\n                originalLanguage\n                static\n                restaurant\n            }\n        }\n        errors {\n            location\n            message\n        }\n    }\n'
): (typeof documents)['\n    fragment FoodFields on FoodResponse {\n        foodData {\n            timestamp\n            meals {\n                name {\n                    de\n                    en\n                }\n                id\n                category\n                prices {\n                    student\n                    employee\n                    guest\n                }\n                allergens\n                flags\n                nutrition {\n                    kj\n                    kcal\n                    fat\n                    fatSaturated\n                    carbs\n                    sugar\n                    fiber\n                    protein\n                    salt\n                }\n                variants {\n                    name {\n                        de\n                        en\n                    }\n                    additional\n                    id\n                    allergens\n                    flags\n                    originalLanguage\n                    static\n                    restaurant\n                    parent {\n                        id\n                        category\n                    }\n                    prices {\n                        student\n                        employee\n                        guest\n                    }\n                }\n                originalLanguage\n                static\n                restaurant\n            }\n        }\n        errors {\n            location\n            message\n        }\n    }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query CampusLifeEvents {\n        clEvents {\n            ...CampusLifeEventFields\n        }\n    }\n'
): (typeof documents)['\n    query CampusLifeEvents {\n        clEvents {\n            ...CampusLifeEventFields\n        }\n    }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment CampusLifeEventFields on ClEvent {\n        host {\n            name\n            website\n            instagram\n        }\n        titles {\n            de\n            en\n        }\n        startDateTime\n        endDateTime\n        location\n        descriptions {\n            de\n            en\n        }\n    }\n'
): (typeof documents)['\n    fragment CampusLifeEventFields on ClEvent {\n        host {\n            name\n            website\n            instagram\n        }\n        titles {\n            de\n            en\n        }\n        startDateTime\n        endDateTime\n        location\n        descriptions {\n            de\n            en\n        }\n    }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    query UniversitySports {\n        universitySports {\n            ...UniversitySportsFields\n        }\n    }\n'
): (typeof documents)['\n    query UniversitySports {\n        universitySports {\n            ...UniversitySportsFields\n        }\n    }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: '\n    fragment UniversitySportsFields on UniversitySports {\n        id\n        title {\n            de\n            en\n        }\n        description {\n            de\n            en\n        }\n        campus\n        location\n        weekday\n        startTime\n        endTime\n        requiresRegistration\n        invitationLink\n        eMail\n        sportsCategory\n    }\n'
): (typeof documents)['\n    fragment UniversitySportsFields on UniversitySports {\n        id\n        title {\n            de\n            en\n        }\n        description {\n            de\n            en\n        }\n        campus\n        location\n        weekday\n        startTime\n        endTime\n        requiresRegistration\n        invitationLink\n        eMail\n        sportsCategory\n    }\n']

export function graphql(source: string) {
    return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
    TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
