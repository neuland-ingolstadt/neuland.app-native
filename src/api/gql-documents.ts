/* eslint-disable @typescript-eslint/no-unused-vars */
import { graphql } from '@/__generated__/gql';

export const ANNOUNCEMENT_QUERY = graphql(/* GraphQL */ `
    query AppAnnouncements {
        appAnnouncements {
            ...AnnouncementFields
        }
    }
`);

const APP_ANNOUNCEMENT_FRAGMENT = graphql(/* GraphQL */ `
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
    }
`);

export const FOOD_QUERY = graphql(/* GraphQL */ `
    query FoodPlan($locations: [LocationInput!]!) {
        food(locations: $locations) {
            ...FoodFields
        }
    }
`);

const FOOD_FRAGMENT = graphql(/* GraphQL */ `
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
`);

export const CAMPUS_LIFE_EVENTS_QUERY = graphql(/* GraphQL */ `
    query CampusLifeEvents {
        clEvents {
            ...CampusLifeEventFields
        }
    }
`);

const CAMPUS_LIFE_EVENTS_FRAGMENT = graphql(/* GraphQL */ `
    fragment CampusLifeEventFields on ClEvent {
        host {
            name
            website
            instagram
        }
        titles {
            de
            en
        }
        startDateTime
        endDateTime
        location
        descriptions {
            de
            en
        }
    }
`);

export const UNIVERSITY_SPORTS_QUERY = graphql(/* GraphQL */ `
    query UniversitySports {
        universitySports {
            ...UniversitySportsFields
        }
    }
`);

const UNIVERSITY_SPORTS_FRAGMENT = graphql(/* GraphQL */ `
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
`);

export const CREATE_ROOM_REPORT = graphql(/* GraphQL */ `
    mutation CreateRoomReport($input: RoomReportInput!) {
        createRoomReport(input: $input) {
            id
        }
    }
`);
