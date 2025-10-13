/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: Date; output: Date; }
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  EmailAddress: { input: string; output: string; }
  /** A local time string (i.e., with no associated timezone) in 24-hr `HH:mm[:ss[.SSS]]` format, e.g. `14:25` or `14:25:06` or `14:25:06.123`.  This scalar is very similar to the `LocalTime`, with the only difference being that `LocalEndTime` also allows `24:00` as a valid value to indicate midnight of the following day.  This is useful when using the scalar to represent the exclusive upper bound of a time block. */
  LocalEndTime: { input: string; output: string; }
  /** Custom food input scalar type for handling both enum values and strings. This is used for the migration of the food query to the new schema. */
  LocationInput: { input: any; output: any; }
  /** A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt. */
  URL: { input: string; output: string; }
};

/** Announcement data to display on top of the apps dashboard */
export type Announcement = {
  __typename?: 'Announcement';
  /** Creation date of the announcement */
  createdAt: Scalars['DateTime']['output'];
  /** Description of the announcement in different languages */
  description: MultiLanguageString;
  /** End date and time when the announcement is displayed */
  endDateTime: Scalars['DateTime']['output'];
  /** Unique identifier of the announcement */
  id: Scalars['ID']['output'];
  /** Image URL for the announcement */
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Platform where the announcement is displayed */
  platform: Array<Platform>;
  /** Priority of the announcement, higher are more important */
  priority: Scalars['Int']['output'];
  /** Start date and time when the announcement is displayed */
  startDateTime: Scalars['DateTime']['output'];
  /** Title of the announcement in different languages */
  title: MultiLanguageString;
  /** Last update date of the announcement */
  updatedAt: Scalars['DateTime']['output'];
  /** URL to the announcement */
  url?: Maybe<Scalars['String']['output']>;
  /** UserKind to target the announcement to specific user groups */
  userKind: Array<UserKind>;
};

/** Input type for the announcement. */
export type AnnouncementInput = {
  /** Description of the announcement in different languages */
  description: MultiLanguageStringInput;
  /** End date and time when the announcement is displayed */
  endDateTime: Scalars['DateTime']['input'];
  /** Image URL for the announcement */
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  /** Platform where the announcement is displayed */
  platform: Array<Platform>;
  /** Priority of the announcement, higher are more important */
  priority: Scalars['Int']['input'];
  /** Start date and time when the announcement is displayed */
  startDateTime: Scalars['DateTime']['input'];
  /** Title of the announcement in different languages */
  title: MultiLanguageStringInput;
  /** URL to the announcement */
  url?: InputMaybe<Scalars['String']['input']>;
  /** UserKind to target the announcement to specific user groups */
  userKind: Array<UserKind>;
};

/** Entry of the audit log for data mutations. */
export type AuditLogEntry = {
  __typename?: 'AuditLogEntry';
  /** Creation date and time of the audit log entry */
  createdAt: Scalars['DateTime']['output'];
  /** Entity of the audit log entry */
  entity: Scalars['String']['output'];
  /** Entity ID of the audit log entry */
  entityId?: Maybe<Scalars['Int']['output']>;
  /** Unique identifier of the audit log entry */
  id: Scalars['ID']['output'];
  /** Name of the user who made the mutation */
  name?: Maybe<Scalars['String']['output']>;
  /** Operation of the audit log entry */
  operation: Scalars['String']['output'];
  /** User ID of the user who made the mutation */
  userId?: Maybe<Scalars['String']['output']>;
};

/** Enum representing the different locations of THI. This is used to categorize the sports events. */
export enum CampusType {
  Ingolstadt = 'Ingolstadt',
  Neuburg = 'Neuburg'
}

/** Career Service Event data type. Information about a specific event from the career service. */
export type CareerServiceEvent = {
  __typename?: 'CareerServiceEvent';
  /**
   * Available slots for the event
   * @deprecated This field is no longer available. Career service events are now sourced from Handshake RSS feed which doesn't provide slot information.
   */
  availableSlots?: Maybe<Scalars['Int']['output']>;
  /** Date of the event */
  date: Scalars['DateTime']['output'];
  /** Description of the event */
  description: Scalars['String']['output'];
  /** Unique identifier of the event */
  id: Scalars['ID']['output'];
  /**
   * Maximum waiting list for the event
   * @deprecated This field is no longer available. Career service events are now sourced from Handshake RSS feed which doesn't provide slot information.
   */
  maxWaitingList?: Maybe<Scalars['Int']['output']>;
  /** Published date of the event */
  publishedDate: Scalars['DateTime']['output'];
  /** Title of the event in German */
  title: Scalars['String']['output'];
  /**
   * Total slots for the event
   * @deprecated This field is no longer available. Career service events are now sourced from Handshake RSS feed which doesn't provide slot information.
   */
  totalSlots?: Maybe<Scalars['Int']['output']>;
  /**
   * Unlimited slots for the event
   * @deprecated This field is no longer available. Career service events are now sourced from Handshake RSS feed which doesn't provide slot information.
   */
  unlimitedSlots?: Maybe<Scalars['Boolean']['output']>;
  /** URL for more information about the event */
  url: Scalars['String']['output'];
  /**
   * Waiting list for the event
   * @deprecated This field is no longer available. Career service events are now sourced from Handshake RSS feed which doesn't provide slot information.
   */
  waitingList?: Maybe<Scalars['Int']['output']>;
};

/** Campus Life Event data type. Information about a specific event on campus. */
export type ClEvent = {
  __typename?: 'ClEvent';
  /**
   * Begin of the event
   * @deprecated Use start field instead with DateTime type
   */
  begin?: Maybe<Scalars['String']['output']>;
  /**
   * Description of the event (only available if it's eligible for external sharing)
   * @deprecated Use descriptions field instead. This field will be removed in the future.
   */
  description?: Maybe<Scalars['String']['output']>;
  /** Description of the event in different languages (only available if it's eligible for external sharing) */
  descriptions?: Maybe<MultiLanguageString>;
  /**
   * End of the event
   * @deprecated Use end field instead with DateTime type
   */
  end?: Maybe<Scalars['String']['output']>;
  /** End of the event */
  endDateTime?: Maybe<Scalars['DateTime']['output']>;
  /** URL to the event website */
  eventUrl?: Maybe<Scalars['URL']['output']>;
  /** Host of the event */
  host: Host;
  /** Unique identifier of the event */
  id: Scalars['ID']['output'];
  /** Boolean if the event is scraped from the moodle calendar or not. */
  isMoodleEvent?: Maybe<Scalars['Boolean']['output']>;
  /** Location of the event (only available if it's eligible for external sharing) */
  location?: Maybe<Scalars['String']['output']>;
  /**
   * Organizer of the event
   * @deprecated Use host field instead
   */
  organizer: Scalars['String']['output'];
  /** Start of the event */
  startDateTime?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Title of the event in German
   * @deprecated Use titles field instead. This field will be removed in the future.
   */
  title: Scalars['String']['output'];
  /** Title of the event in different languages */
  titles: MultiLanguageString;
};

/** Provides a list of meals for a specific day */
export type Food = {
  __typename?: 'Food';
  /** List of meals */
  meals?: Maybe<Array<Meal>>;
  /** Date of the meal list */
  timestamp: Scalars['String']['output'];
};

/** Error message for the food query */
export type FoodError = {
  __typename?: 'FoodError';
  /** Location of the restaurant */
  location: Scalars['String']['output'];
  /** Error message */
  message: Scalars['String']['output'];
};

export type FoodResponse = {
  __typename?: 'FoodResponse';
  /** Error message for the food query */
  errors?: Maybe<Array<FoodError>>;
  /** List of meal days */
  foodData?: Maybe<Array<Food>>;
};

/** Host of the event, usually a club or student group. */
export type Host = {
  __typename?: 'Host';
  /** Instagram URL of the event host */
  instagram?: Maybe<Scalars['URL']['output']>;
  /** Name of the event host */
  name: Scalars['String']['output'];
  /** URL to the event host website */
  website?: Maybe<Scalars['URL']['output']>;
};

/** Input type for the host of an event. */
export type HostInput = {
  /** Instagram URL of the event host */
  instagram?: InputMaybe<Scalars['URL']['input']>;
  /** Name of the event host */
  name: Scalars['String']['input'];
  /** URL to the event host website */
  website?: InputMaybe<Scalars['URL']['input']>;
};

/** Input type for the manual campus life event. These events are created by the administrators and are not fetched from an external source. */
export type ManualCampusLifeEventInput = {
  /** Begin date and time of the event */
  begin: Scalars['DateTime']['input'];
  /** Description of the event in different languages */
  description?: InputMaybe<MultiLanguageStringInput>;
  /** End date and time of the event */
  end?: InputMaybe<Scalars['DateTime']['input']>;
  /** Host / organizer of the event */
  host: HostInput;
  /** Location of the event */
  location?: InputMaybe<Scalars['String']['input']>;
  /** Title of the event in different languages */
  title: MultiLanguageStringInput;
  /** Website of the event */
  website?: InputMaybe<Scalars['URL']['input']>;
};

/** Meal data */
export type Meal = {
  __typename?: 'Meal';
  /** List of allergens (e.g. gluten, lactose, etc.) */
  allergens?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Category of the meal (main, soup or salad) */
  category: Scalars['String']['output'];
  /** List of flags (e.g. vegan, vegetarian, etc.) */
  flags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Unique identifier of the meal on the specific day */
  id: Scalars['ID']['output'];
  /** Unique identifier of the meal, independent of the day */
  mealId: Scalars['ID']['output'];
  /** Name of the meal in different languages */
  name: MultiLanguageString;
  /** Nutritional values for the meal */
  nutrition?: Maybe<Nutrition>;
  /** Original language of the meal name */
  originalLanguage: OriginalLanguage;
  /** Prices for different types of customers (student, employee, guest) */
  prices: Prices;
  /** Restaurant where the meal is available (IngolstadtMensa, NeuburgMensa, Reimanns, Canisius) */
  restaurant: Scalars['String']['output'];
  /** Static meals are always available, non-static meals are only available on specific days */
  static: Scalars['Boolean']['output'];
  /** Variants or toppings of the meal, like bread, sauce, etc. */
  variants?: Maybe<Array<Variation>>;
};

/** String in multiple languages (German and English) */
export type MultiLanguageString = {
  __typename?: 'MultiLanguageString';
  /** German language code */
  de?: Maybe<Scalars['String']['output']>;
  /** English language code */
  en?: Maybe<Scalars['String']['output']>;
};

/** Input type for the multi language string. */
export type MultiLanguageStringInput = {
  de: Scalars['String']['input'];
  en: Scalars['String']['input'];
};

/** Mutation type to update data. */
export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new room report. */
  createRoomReport?: Maybe<UpsertResponse>;
  /** Delete an announcement by ID. Note: This mutation is only available for authenticated users. */
  deleteAppAnnouncement?: Maybe<Scalars['Boolean']['output']>;
  /** Delete a manual campus life event by ID. Note: This mutation is only available for authenticated users. */
  deleteManualClEvent?: Maybe<Scalars['Boolean']['output']>;
  /** Delete a Neuland event by ID. Note: This mutation is only available for authenticated users. */
  deleteNeulandEvent?: Maybe<Scalars['Boolean']['output']>;
  /** Delete a university sports event by ID. Note: This mutation is only available for authenticated users. */
  deleteUniversitySport?: Maybe<Scalars['Boolean']['output']>;
  /** Resolve a room report by ID. Note: This mutation is only available for authenticated users. */
  resolveRoomReport?: Maybe<UpsertResponse>;
  /** Create or update an announcement. If an ID is provided, the announcement is updated, otherwise a new announcement is created. Note: This mutation is only available for authenticated users. */
  upsertAppAnnouncement?: Maybe<UpsertResponse>;
  /** Create or update a manual campus life event. Note: This mutation is only available for authenticated users. */
  upsertManualClEvent?: Maybe<UpsertResponse>;
  /** Create or update a Neuland event. If an ID is provided, the event is updated, otherwise a new event is created. Note: This mutation is only available for authenticated users. */
  upsertNeulandEvent?: Maybe<UpsertResponse>;
  /** Create or update a university sports event. If an ID is provided, the event is updated, otherwise a new event is created. Note: This mutation is only available for authenticated users. */
  upsertUniversitySport?: Maybe<UpsertResponse>;
};


/** Mutation type to update data. */
export type MutationCreateRoomReportArgs = {
  input: RoomReportInput;
};


/** Mutation type to update data. */
export type MutationDeleteAppAnnouncementArgs = {
  id: Scalars['ID']['input'];
};


/** Mutation type to update data. */
export type MutationDeleteManualClEventArgs = {
  id: Scalars['ID']['input'];
};


/** Mutation type to update data. */
export type MutationDeleteNeulandEventArgs = {
  id: Scalars['ID']['input'];
};


/** Mutation type to update data. */
export type MutationDeleteUniversitySportArgs = {
  id: Scalars['ID']['input'];
};


/** Mutation type to update data. */
export type MutationResolveRoomReportArgs = {
  id: Scalars['ID']['input'];
  resolved?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Mutation type to update data. */
export type MutationUpsertAppAnnouncementArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: AnnouncementInput;
};


/** Mutation type to update data. */
export type MutationUpsertManualClEventArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: ManualCampusLifeEventInput;
};


/** Mutation type to update data. */
export type MutationUpsertNeulandEventArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: NeulandEventInput;
};


/** Mutation type to update data. */
export type MutationUpsertUniversitySportArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  input: UniversitySportsInput;
};

/** Events by Neuland Ingolstadt e.V. */
export type NeulandEvent = {
  __typename?: 'NeulandEvent';
  /** Creation date and time of the event */
  createdAt: Scalars['DateTime']['output'];
  /** Description of the event in different languages */
  description?: Maybe<MultiLanguageString>;
  /** End date and time of the event */
  endTime?: Maybe<Scalars['DateTime']['output']>;
  /** Unique identifier of the event */
  id: Scalars['ID']['output'];
  /** Location where the event takes place */
  location?: Maybe<Scalars['String']['output']>;
  /** Recurrence rule for recurring events (uses iCalendar RRULE format) */
  rrule?: Maybe<Scalars['String']['output']>;
  /** Start date and time of the event */
  startTime?: Maybe<Scalars['DateTime']['output']>;
  /** Title of the event in different languages */
  title: MultiLanguageString;
  /** Last update date and time of the event */
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** Input type for a event by Neuland Ingolstadt e.V. */
export type NeulandEventInput = {
  /** Description of the event in different languages */
  description?: InputMaybe<MultiLanguageStringInput>;
  /** End date and time of the event */
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  /** Location where the event takes place */
  location?: InputMaybe<Scalars['String']['input']>;
  /** Recurrence rule for recurring events (uses iCalendar RRULE format) */
  rrule?: InputMaybe<Scalars['String']['input']>;
  /** Start date and time of the event */
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
  /** Title of the event in different languages */
  title: MultiLanguageStringInput;
};

/** Nutritional values for a meal. Currently only available at Mensa. Values are per average portion. */
export type Nutrition = {
  __typename?: 'Nutrition';
  /** Carbohydrates in grams */
  carbs: Scalars['Float']['output'];
  /** Fat in grams */
  fat: Scalars['Float']['output'];
  /** Saturated fat in grams */
  fatSaturated: Scalars['Float']['output'];
  /** Fiber in grams */
  fiber: Scalars['Float']['output'];
  /** Energy in kilocalories */
  kcal: Scalars['Float']['output'];
  /** Energy in kilojoules */
  kj: Scalars['Float']['output'];
  /** Protein in grams */
  protein: Scalars['Float']['output'];
  /** Salt in grams */
  salt: Scalars['Float']['output'];
  /** Sugar in grams */
  sugar: Scalars['Float']['output'];
};

/** Enum representing the original language of a meal. */
export enum OriginalLanguage {
  /** German language code */
  De = 'de',
  /** English language code */
  En = 'en'
}

/** Parent meal for a variant meal */
export type Parent = {
  __typename?: 'Parent';
  /** Category of the parent meal (main, soup or salad) */
  category: Scalars['String']['output'];
  /** Unique identifier of the parent meal */
  id: Scalars['ID']['output'];
  /** Name of the parent meal in different languages */
  name: MultiLanguageString;
};

/** Enum representing the platform of the user. This is used to target announcements to specific user groups. */
export enum Platform {
  /** Android */
  Android = 'ANDROID',
  /** iOS */
  Ios = 'IOS',
  /** Web */
  Web = 'WEB',
  /** Web Development Version */
  WebDev = 'WEB_DEV'
}

/** Prices for different types of customers */
export type Prices = {
  __typename?: 'Prices';
  /** Price for employees */
  employee?: Maybe<Scalars['Float']['output']>;
  /** Price for guests */
  guest?: Maybe<Scalars['Float']['output']>;
  /** Price for students */
  student?: Maybe<Scalars['Float']['output']>;
};

/** Root query */
export type Query = {
  __typename?: 'Query';
  /**
   * Get the current announcements
   * @deprecated Use appAnnouncements query instead
   */
  announcements: Array<Announcement>;
  /** Get the current in app announcements. */
  appAnnouncements: Array<Announcement>;
  /** Get the audit log entries. Note: This query is only available for authenticated admin users. */
  auditLog: Array<AuditLogEntry>;
  /** Get all events of the career service. */
  careerServiceEvents: Array<CareerServiceEvent>;
  /**
   * Get all campus life clubs
   * @deprecated Use Campus Life API instead
   */
  clClubs: Array<Host>;
  /**
   * Get the campus life events
   * @deprecated Use Campus Life API instead
   */
  clEvents: Array<ClEvent>;
  /** Get the meal plan for a specific restaurant. */
  food: FoodResponse;
  /** Get all events by Neuland Ingolstadt e.V. */
  neulandEvents: Array<NeulandEvent>;
  /** Get the room reports. Note: This query is only available for authenticated users. */
  roomReports: Array<RoomReport>;
  /** Get all events of the Student Counselling Office. */
  studentCounsellingEvents: Array<StudentCounsellingEvent>;
  /** Get the university sports events. This includes all sports events from all campuses. */
  universitySports?: Maybe<Array<UniversitySports>>;
};


/** Root query */
export type QueryAppAnnouncementsArgs = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Root query */
export type QueryAuditLogArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


/** Root query */
export type QueryFoodArgs = {
  locations: Array<Scalars['LocationInput']['input']>;
};

/** Enum representing the different restaurant locations. This is used as a parameter for the food query. */
export enum RestaurantLocation {
  /** Canisius */
  Canisius = 'Canisius',
  /** Ingolstadt Mensa */
  IngolstadtMensa = 'IngolstadtMensa',
  /** Neuburg Mensa */
  NeuburgMensa = 'NeuburgMensa',
  /** Reimanns */
  Reimanns = 'Reimanns'
}

/** Get all room reports. Contains user reports of wrong room data. */
export type RoomReport = {
  __typename?: 'RoomReport';
  /** Creation date of the report */
  createdAt: Scalars['DateTime']['output'];
  /** description of the report */
  description?: Maybe<Scalars['String']['output']>;
  /** Unique identifier of the report */
  id: Scalars['ID']['output'];
  /** Reason for the report. This is a enum wiht report categories. */
  reason: RoomReportCategory;
  /** Resolved date of the report or null if not resolved */
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Room name */
  room: Scalars['String']['output'];
};

/** Enum representing the different room report categories. This is used to categorize the reason for the report. */
export enum RoomReportCategory {
  Missing = 'MISSING',
  NotExisting = 'NOT_EXISTING',
  Other = 'OTHER',
  WrongDescription = 'WRONG_DESCRIPTION',
  WrongLocation = 'WRONG_LOCATION'
}

/** Room report input type. Used to create a new report about incorrect room data. */
export type RoomReportInput = {
  /** description of the report */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Reason for the report. */
  reason: RoomReportCategory;
  /** Room name */
  room: Scalars['String']['input'];
};

/** Enum representing the different sports categories. This is used to categorize the sports events. */
export enum SportsCategoryType {
  Badminton = 'Badminton',
  Baseball = 'Baseball',
  Basketball = 'Basketball',
  Boxing = 'Boxing',
  Calisthenics = 'Calisthenics',
  Climbing = 'Climbing',
  Cycling = 'Cycling',
  Dancing = 'Dancing',
  Defense = 'Defense',
  Frisbee = 'Frisbee',
  FullBodyWorkout = 'FullBodyWorkout',
  Handball = 'Handball',
  Hiking = 'Hiking',
  Hockey = 'Hockey',
  Jogging = 'Jogging',
  Kickboxing = 'Kickboxing',
  MartialArts = 'MartialArts',
  Meditation = 'Meditation',
  Other = 'Other',
  Parkour = 'Parkour',
  Rowing = 'Rowing',
  Running = 'Running',
  Skateboarding = 'Skateboarding',
  Soccer = 'Soccer',
  Spikeball = 'Spikeball',
  StrengthTraining = 'StrengthTraining',
  Swimming = 'Swimming',
  TableTennis = 'TableTennis',
  Tennis = 'Tennis',
  Volleyball = 'Volleyball',
  Waterpolo = 'Waterpolo',
  Yoga = 'Yoga'
}

/** Information about a specific event from the student Counselling Office. */
export type StudentCounsellingEvent = {
  __typename?: 'StudentCounsellingEvent';
  /** Available slots for the event */
  availableSlots?: Maybe<Scalars['Int']['output']>;
  /** Date of the event */
  date: Scalars['DateTime']['output'];
  /** Unique identifier of the event */
  id: Scalars['ID']['output'];
  /** Maximum waiting list for the event */
  maxWaitingList?: Maybe<Scalars['Int']['output']>;
  /** Title of the event in German */
  title: Scalars['String']['output'];
  /** Total slots for the event */
  totalSlots?: Maybe<Scalars['Int']['output']>;
  /** Unlimited slots for the event */
  unlimitedSlots: Scalars['Boolean']['output'];
  /** URL for more information about the event */
  url?: Maybe<Scalars['String']['output']>;
  /** Waiting list for the event */
  waitingList?: Maybe<Scalars['Int']['output']>;
};

/** University sports event. Represents a sports event from the university sports program. */
export type UniversitySports = {
  __typename?: 'UniversitySports';
  /** Campus where the sports event belongs to. This is not the location of the event itself. */
  campus: CampusType;
  /** Creation date of the sports event */
  createdAt: Scalars['DateTime']['output'];
  /** Description of the sports event in different languages */
  description?: Maybe<MultiLanguageString>;
  /** E-Mail address for registration or contact */
  eMail?: Maybe<Scalars['EmailAddress']['output']>;
  /** End time of the sports event */
  endTime?: Maybe<Scalars['LocalEndTime']['output']>;
  /** Unique identifier of the sports event */
  id: Scalars['ID']['output'];
  /** Invitation link for the sports event, e.g. a WhatsApp group */
  invitationLink?: Maybe<Scalars['String']['output']>;
  /** Location of the sports event */
  location: Scalars['String']['output'];
  /** True if the sports event requires registration */
  requiresRegistration: Scalars['Boolean']['output'];
  /** Category of the sports event (e.g. soccer, basketball, etc.) */
  sportsCategory: SportsCategoryType;
  /** Start time of the sports event */
  startTime: Scalars['LocalEndTime']['output'];
  /** Title of the sports event in different languages */
  title: MultiLanguageString;
  /** Last update date of the sports event */
  updatedAt: Scalars['DateTime']['output'];
  /** Weekday of the sports event */
  weekday: WeekdayType;
};

/** Input type for the university sports event. */
export type UniversitySportsInput = {
  /** Campus where the sports event belongs to. This is not the location of the event itself. */
  campus: CampusType;
  /** Description of the sports event in different languages */
  description?: InputMaybe<MultiLanguageStringInput>;
  /** E-Mail address for registration or contact */
  eMail?: InputMaybe<Scalars['EmailAddress']['input']>;
  /** End time of the sports event as Unix timestamp */
  endTime?: InputMaybe<Scalars['LocalEndTime']['input']>;
  /** Invitation link for the sports event, e.g. a WhatsApp group */
  invitationLink?: InputMaybe<Scalars['String']['input']>;
  /** Location of the sports event */
  location: Scalars['String']['input'];
  /** True if the sports event requires registration */
  requiresRegistration: Scalars['Boolean']['input'];
  /** Category of the sports event (e.g. soccer, basketball, etc.) */
  sportsCategory: SportsCategoryType;
  /** Start time of the sports event as Unix timestamp */
  startTime: Scalars['LocalEndTime']['input'];
  /** Title of the sports event in different languages */
  title: MultiLanguageStringInput;
  /** Weekday of the sports event */
  weekday: WeekdayType;
};

export type UpsertResponse = {
  __typename?: 'UpsertResponse';
  id?: Maybe<Scalars['ID']['output']>;
};

/** Enum representing the kind of user. This is used to target announcements to specific user groups. */
export enum UserKind {
  /** Employee */
  Employee = 'EMPLOYEE',
  /** Guest */
  Guest = 'GUEST',
  /** Student */
  Student = 'STUDENT'
}

/** Variants of a meal */
export type Variation = {
  __typename?: 'Variation';
  /** True if the variant is an additional topping and not a variant of the meal */
  additional: Scalars['Boolean']['output'];
  /** List of allergens (e.g. gluten, lactose, etc.) */
  allergens?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** List of flags (e.g. vegan, vegetarian, etc.) */
  flags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Unique identifier of the variant */
  id: Scalars['ID']['output'];
  /** Unique identifier of the meal, independent of the day */
  mealId: Scalars['ID']['output'];
  /** Name of the variant in different languages */
  name: MultiLanguageString;
  /** Nutritional values for the variant */
  nutrition?: Maybe<Nutrition>;
  /** Original language of the variant name */
  originalLanguage: OriginalLanguage;
  /** Parent meal for a variant meal */
  parent?: Maybe<Parent>;
  /** Prices for different types of customers (student, employee, guest) */
  prices: Prices;
  /** Restaurant where the variant is available (IngolstadtMensa, NeuburgMensa, Reimanns, Canisius) */
  restaurant?: Maybe<Scalars['String']['output']>;
  /** Static variants are always available, non-static variants are only available on specific days */
  static: Scalars['Boolean']['output'];
};

/** Enum representing the different weekdays. This is used to categorize the sports events. */
export enum WeekdayType {
  Friday = 'Friday',
  Monday = 'Monday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
  Thursday = 'Thursday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday'
}

export type AppAnnouncementsQueryVariables = Exact<{ [key: string]: never; }>;


export type AppAnnouncementsQuery = { __typename?: 'Query', appAnnouncements: Array<(
    { __typename?: 'Announcement' }
    & { ' $fragmentRefs'?: { 'AnnouncementFieldsFragment': AnnouncementFieldsFragment } }
  )> };

export type AnnouncementFieldsFragment = { __typename?: 'Announcement', id: string, startDateTime: Date, endDateTime: Date, priority: number, url?: string | null, platform: Array<Platform>, userKind: Array<UserKind>, imageUrl?: string | null, title: { __typename?: 'MultiLanguageString', de?: string | null, en?: string | null }, description: { __typename?: 'MultiLanguageString', de?: string | null, en?: string | null } } & { ' $fragmentName'?: 'AnnouncementFieldsFragment' };

export type FoodPlanQueryVariables = Exact<{
  locations: Array<Scalars['LocationInput']['input']> | Scalars['LocationInput']['input'];
}>;


export type FoodPlanQuery = { __typename?: 'Query', food: (
    { __typename?: 'FoodResponse' }
    & { ' $fragmentRefs'?: { 'FoodFieldsFragment': FoodFieldsFragment } }
  ) };

export type FoodFieldsFragment = { __typename?: 'FoodResponse', foodData?: Array<{ __typename?: 'Food', timestamp: string, meals?: Array<{ __typename?: 'Meal', id: string, category: string, allergens?: Array<string | null> | null, flags?: Array<string | null> | null, originalLanguage: OriginalLanguage, static: boolean, restaurant: string, name: { __typename?: 'MultiLanguageString', de?: string | null, en?: string | null }, prices: { __typename?: 'Prices', student?: number | null, employee?: number | null, guest?: number | null }, nutrition?: { __typename?: 'Nutrition', kj: number, kcal: number, fat: number, fatSaturated: number, carbs: number, sugar: number, fiber: number, protein: number, salt: number } | null, variants?: Array<{ __typename?: 'Variation', additional: boolean, id: string, allergens?: Array<string | null> | null, flags?: Array<string | null> | null, originalLanguage: OriginalLanguage, static: boolean, restaurant?: string | null, name: { __typename?: 'MultiLanguageString', de?: string | null, en?: string | null }, parent?: { __typename?: 'Parent', id: string, category: string } | null, prices: { __typename?: 'Prices', student?: number | null, employee?: number | null, guest?: number | null } }> | null }> | null }> | null, errors?: Array<{ __typename?: 'FoodError', location: string, message: string }> | null } & { ' $fragmentName'?: 'FoodFieldsFragment' };

export type CampusLifeEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type CampusLifeEventsQuery = { __typename?: 'Query', clEvents: Array<(
    { __typename?: 'ClEvent' }
    & { ' $fragmentRefs'?: { 'CampusLifeEventFieldsFragment': CampusLifeEventFieldsFragment } }
  )> };

export type CampusLifeEventFieldsFragment = { __typename?: 'ClEvent', id: string, startDateTime?: Date | null, endDateTime?: Date | null, location?: string | null, host: { __typename?: 'Host', name: string, website?: string | null, instagram?: string | null }, titles: { __typename?: 'MultiLanguageString', de?: string | null, en?: string | null }, descriptions?: { __typename?: 'MultiLanguageString', de?: string | null, en?: string | null } | null } & { ' $fragmentName'?: 'CampusLifeEventFieldsFragment' };

export type UniversitySportsQueryVariables = Exact<{ [key: string]: never; }>;


export type UniversitySportsQuery = { __typename?: 'Query', universitySports?: Array<(
    { __typename?: 'UniversitySports' }
    & { ' $fragmentRefs'?: { 'UniversitySportsFieldsFragment': UniversitySportsFieldsFragment } }
  )> | null };

export type UniversitySportsFieldsFragment = { __typename?: 'UniversitySports', id: string, campus: CampusType, location: string, weekday: WeekdayType, startTime: string, endTime?: string | null, requiresRegistration: boolean, invitationLink?: string | null, eMail?: string | null, sportsCategory: SportsCategoryType, title: { __typename?: 'MultiLanguageString', de?: string | null, en?: string | null }, description?: { __typename?: 'MultiLanguageString', de?: string | null, en?: string | null } | null } & { ' $fragmentName'?: 'UniversitySportsFieldsFragment' };

export type CreateRoomReportMutationVariables = Exact<{
  input: RoomReportInput;
}>;


export type CreateRoomReportMutation = { __typename?: 'Mutation', createRoomReport?: { __typename?: 'UpsertResponse', id?: string | null } | null };

export type CareerServiceEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type CareerServiceEventsQuery = { __typename?: 'Query', careerServiceEvents: Array<(
    { __typename?: 'CareerServiceEvent' }
    & { ' $fragmentRefs'?: { 'CareerServiceEventFieldsFragment': CareerServiceEventFieldsFragment } }
  )> };

export type CareerServiceEventFieldsFragment = { __typename?: 'CareerServiceEvent', id: string, title: string, description: string, date: Date, url: string, publishedDate: Date } & { ' $fragmentName'?: 'CareerServiceEventFieldsFragment' };

export type StudentCounsellingEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type StudentCounsellingEventsQuery = { __typename?: 'Query', studentCounsellingEvents: Array<(
    { __typename?: 'StudentCounsellingEvent' }
    & { ' $fragmentRefs'?: { 'StudentCounsellingEventFieldsFragment': StudentCounsellingEventFieldsFragment } }
  )> };

export type StudentCounsellingEventFieldsFragment = { __typename?: 'StudentCounsellingEvent', id: string, title: string, date: Date, unlimitedSlots: boolean, availableSlots?: number | null, totalSlots?: number | null, waitingList?: number | null, maxWaitingList?: number | null, url?: string | null } & { ' $fragmentName'?: 'StudentCounsellingEventFieldsFragment' };

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
export const CampusLifeEventFieldsFragmentDoc = new TypedDocumentString(`
    fragment CampusLifeEventFields on ClEvent {
  id
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
    `, {"fragmentName":"CampusLifeEventFields"}) as unknown as TypedDocumentString<CampusLifeEventFieldsFragment, unknown>;
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
export const CareerServiceEventFieldsFragmentDoc = new TypedDocumentString(`
    fragment CareerServiceEventFields on CareerServiceEvent {
  id
  title
  description
  date
  url
  publishedDate
}
    `, {"fragmentName":"CareerServiceEventFields"}) as unknown as TypedDocumentString<CareerServiceEventFieldsFragment, unknown>;
export const StudentCounsellingEventFieldsFragmentDoc = new TypedDocumentString(`
    fragment StudentCounsellingEventFields on StudentCounsellingEvent {
  id
  title
  date
  unlimitedSlots
  availableSlots
  totalSlots
  waitingList
  maxWaitingList
  url
}
    `, {"fragmentName":"StudentCounsellingEventFields"}) as unknown as TypedDocumentString<StudentCounsellingEventFieldsFragment, unknown>;
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
export const CampusLifeEventsDocument = new TypedDocumentString(`
    query CampusLifeEvents {
  clEvents {
    ...CampusLifeEventFields
  }
}
    fragment CampusLifeEventFields on ClEvent {
  id
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
}`) as unknown as TypedDocumentString<CampusLifeEventsQuery, CampusLifeEventsQueryVariables>;
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
export const CareerServiceEventsDocument = new TypedDocumentString(`
    query CareerServiceEvents {
  careerServiceEvents {
    ...CareerServiceEventFields
  }
}
    fragment CareerServiceEventFields on CareerServiceEvent {
  id
  title
  description
  date
  url
  publishedDate
}`) as unknown as TypedDocumentString<CareerServiceEventsQuery, CareerServiceEventsQueryVariables>;
export const StudentCounsellingEventsDocument = new TypedDocumentString(`
    query StudentCounsellingEvents {
  studentCounsellingEvents {
    ...StudentCounsellingEventFields
  }
}
    fragment StudentCounsellingEventFields on StudentCounsellingEvent {
  id
  title
  date
  unlimitedSlots
  availableSlots
  totalSlots
  waitingList
  maxWaitingList
  url
}`) as unknown as TypedDocumentString<StudentCounsellingEventsQuery, StudentCounsellingEventsQueryVariables>;