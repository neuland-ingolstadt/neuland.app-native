# Changelog

All notable changes to this project will be documented in this file.

## [unreleased]

### 🚀 Features

- _(grades)_ Adds subject search option - by @Robert27 ([2c522f3](https://github.com/neuland-ingolstadt/neuland.app-native/commit/2c522f3921ccfa36b25b0d3d63ea87ed18cd4626))
- _(widget, ios)_ Add timetable control center widget - by @Robert27 ([57a0b54](https://github.com/neuland-ingolstadt/neuland.app-native/commit/57a0b5456d0e99b469092b1296f897c58fb11055))
- _(widget,ios)_ Add control center widget - by @Robert27 ([2801b5d](https://github.com/neuland-ingolstadt/neuland.app-native/commit/2801b5dfdc7ef88a4042dd6feda2485b324fcda9))

### 🐛 Bug Fixes

- _(map)_ Remove bottom margin in map screen on iOS - by @Robert27 ([0d8b292](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0d8b2925241fd2a0ba5b6f0852cb9d724ec2c3ea))
- _(quick-actions)_ Fix incorrect href params - by @Robert27 ([5fce464](https://github.com/neuland-ingolstadt/neuland.app-native/commit/5fce4648a76c88222fbc543190353d99dc79a09d))
- _(web)_ Hide duplicate share button - by @Robert27 ([ec998e3](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ec998e3c672ffdf722d7274f7be460c15532727c))
- _(web)_ Switch to http-server to correctly serve public files - by @Robert27 ([181a8c2](https://github.com/neuland-ingolstadt/neuland.app-native/commit/181a8c2221e1a4e50d3abd894770763cddfdb08d))
- Include exam dates in first day timetable calculation - by @Robert27 ([0c633fc](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0c633fcb8e4973698404172a07be639e1c88fa11))
- Improve event sorting in CalendarCard to prioritize single-day events - by @Robert27 ([2bac0dd](https://github.com/neuland-ingolstadt/neuland.app-native/commit/2bac0ddc2c55015a788fdc8d28ced048544d1215))

### 🚜 Refactor

- _(ios)_ Add alternative app icons to expo prebuild pipeline ([#158](https://github.com/neuland-ingolstadt/neuland.app-native/issues/158)) - by @Robert27 ([03e8e43](https://github.com/neuland-ingolstadt/neuland.app-native/commit/03e8e4347e3a4856aaf8d2224d9f6219348b0b33))

### ⚡ Performance

- Migrate to expo-quick-actions for improved shortcut handling - by @Robert27 ([10cd247](https://github.com/neuland-ingolstadt/neuland.app-native/commit/10cd2471831787301247b3b519ea748be61212c6))

### 🎨 Styling

- Update Tabbar component styles for better appearance on Android - by @Robert27 ([2fa777e](https://github.com/neuland-ingolstadt/neuland.app-native/commit/2fa777e30674a0acb4f1df38487b11cfe0b97b41))
- Redesign detail pages and navigation behaviour - by @Robert27 ([bf30287](https://github.com/neuland-ingolstadt/neuland.app-native/commit/bf30287fb434a3a3a92b619c7b3682e6ed9d1918))

### ⚙️ Miscellaneous Tasks

- Revert migration to new bun.lock file - by @Robert27 ([8028070](https://github.com/neuland-ingolstadt/neuland.app-native/commit/8028070181045cf572af0fc1b56b6d10e8ea0961))
- Update app image name to match cd pipeline - by @Robert27 ([27eace0](https://github.com/neuland-ingolstadt/neuland.app-native/commit/27eace0bbf91f427de83ff659c688e7270e44835))

## [0.11.2](https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.11.1..0.11.2) - 2025-01-18

### 🚀 Features

- _(tests)_ Add unit tests for timetable utilities - by @Robert27 ([00f7cd9](https://github.com/neuland-ingolstadt/neuland.app-native/commit/00f7cd906fcc00f565f23c8bea0f1471298e2a1f))
- _(tests)_ Enhance test coverage reporting with Jest JUnit integration ([#160](https://github.com/neuland-ingolstadt/neuland.app-native/issues/160)) - by @Robert27 ([e5e4d83](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e5e4d83a2b32edb2fd02fc953351e4702f0ea0e3))
- _(web)_ Add Root component for static HTML rendering - by @Robert27 ([63e0a3d](https://github.com/neuland-ingolstadt/neuland.app-native/commit/63e0a3db14b485cf2ff830b09a74d0919a9bd15b))

### 🐛 Bug Fixes

- _(food)_ Add optional chaining for meal variants length check - by @Robert27 ([86e8330](https://github.com/neuland-ingolstadt/neuland.app-native/commit/86e8330dc3a9975b099355df094859ce0c1607ff))
- _(map)_ Update Maplibre import structure - by @Robert27 ([ba68bea](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ba68bea1a6971bc50356de8753bb70e664083896))
- _(settings)_ Add missing share url on android - by @Robert27 ([ac53d5a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ac53d5a88e02538f2ade4c5058d80c5f348b838e))
- _(storage)_ Improve error handling and support ArrayBuffer in setItem - by @Robert27 ([26e2560](https://github.com/neuland-ingolstadt/neuland.app-native/commit/26e256052926fb01ce4291b35f8c8bea26fe9601))
- _(timetable)_ Sort combined timetable data by date - by @Robert27 ([96d2b04](https://github.com/neuland-ingolstadt/neuland.app-native/commit/96d2b046c7b77ee07da1d9ea1e15e346f7077913))

### 📚 Documentation

- Update copyright year to 2025 in footer - by @Robert27 ([5279427](https://github.com/neuland-ingolstadt/neuland.app-native/commit/5279427c3985fea0d8f1357a55fbdca88ddf207a))
- Update readme - by @Robert27 ([92bd5d2](https://github.com/neuland-ingolstadt/neuland.app-native/commit/92bd5d250e8c881e9317903fbb77a51bb3fb9395))

### 🧪 Testing

- Add more timetable tests ([#161](https://github.com/neuland-ingolstadt/neuland.app-native/issues/161)) - by @Robert27 ([6d8c508](https://github.com/neuland-ingolstadt/neuland.app-native/commit/6d8c5085d087f5318381b7781f398a77f6791595))
- Adjust codecov thresholds to 0.5% - by @Robert27 ([36c2149](https://github.com/neuland-ingolstadt/neuland.app-native/commit/36c21495fa772219fa20cf125b7d91dfb3d821a8))

### ⚙️ Miscellaneous Tasks

- _(tests)_ Update configuration to include source paths for coverage reporting - by @Robert27 ([fce4fa5](https://github.com/neuland-ingolstadt/neuland.app-native/commit/fce4fa5179c5af40d742730b4365e324e4760aa8))
- Update deployment triggers to include tag pushes - by @Robert27 ([fe2178e](https://github.com/neuland-ingolstadt/neuland.app-native/commit/fe2178e9460c77f33bd91e25762d6c78bf009cf4))
- Update Docker actions to latest versions in deployment workflow - by @Robert27 ([25b9177](https://github.com/neuland-ingolstadt/neuland.app-native/commit/25b9177c42f1bf1047b2b5eef209d13951d9145d))
- Set NODE_BINARY environment variable in ios post-clone script - by @Robert27 ([0422ee2](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0422ee2475529634a5167cb87625248ae9cfc686))

**Full Changelog**: https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.11.1...0.11.2

## [0.11.1](https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.11.0..0.11.1) - 2024-12-30

### 🐛 Bug Fixes

- _(login)_ Prevent white screen during login redirect - by @Robert27 ([f6285b6](https://github.com/neuland-ingolstadt/neuland.app-native/commit/f6285b6fe0b3e20f79a1020756daf23c0fa2fd6a))
- _(timetable)_ Set default timetable mode in TimetableWeek component - by @Robert27 ([33cb8c6](https://github.com/neuland-ingolstadt/neuland.app-native/commit/33cb8c616f172a48192c6f10866ba85eea987f81))

### ⚙️ Miscellaneous Tasks

- Bump to version 0.11.1 - by @Robert27 ([a1905c3](https://github.com/neuland-ingolstadt/neuland.app-native/commit/a1905c3f43b6e732c2ccefe7468babe6cd3d3e5e))

**Full Changelog**: https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.11.0...0.11.1

## [0.11.0](https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.10.1..0.11.0) - 2024-12-28

### 🚀 Features

- _(announcements)_ Add analytics and improve logic - by @Robert27 ([f8245f7](https://github.com/neuland-ingolstadt/neuland.app-native/commit/f8245f7549d2b1f3ebb7416abef8d011a0fc0f2f))
- _(api)_ Add GraphQL code generation ([#130](https://github.com/neuland-ingolstadt/neuland.app-native/issues/130)) - by @Robert27 ([e824635](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e824635ab1d4dd6104ee6d5f0c7fcb27758b1dee))
- _(api)_ Extend announcement popup with platform and userKind filter - by @Robert27 ([918026c](https://github.com/neuland-ingolstadt/neuland.app-native/commit/918026cea7faa694097deb1c9496cf19d4b00cbe))
- _(app)_ Enable react native new arch ([#131](https://github.com/neuland-ingolstadt/neuland.app-native/issues/131)) - by @Robert27 ([5f143fd](https://github.com/neuland-ingolstadt/neuland.app-native/commit/5f143fda6487d088c74bfa0ab582b2f237161477))
- _(app)_ Add truly native tabbar ([#128](https://github.com/neuland-ingolstadt/neuland.app-native/issues/128)) - by @Robert27 ([a08e7f5](https://github.com/neuland-ingolstadt/neuland.app-native/commit/a08e7f5950bb485cd477389083ee0e9fe1cf08c2))
- _(error)_ Include current pathname in feedback email content - by @Robert27 ([442b861](https://github.com/neuland-ingolstadt/neuland.app-native/commit/442b86160993a2b80f08ca8ae3f26d935b5ce6d7))
- _(events)_ Replace static club data with api data - by @Robert27 ([a17bd68](https://github.com/neuland-ingolstadt/neuland.app-native/commit/a17bd68ca25e3a2d043adf310f32ac45829dee70))
- _(grades, profile)_ Add app state handling for privacy visibility - by @Robert27 ([7e4b463](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7e4b463425d2da5fccd6bf3745fa40361553b755))
- _(library)_ Remove booking and add new sheet ([#153](https://github.com/neuland-ingolstadt/neuland.app-native/issues/153)) - by @Robert27 ([9b60ac4](https://github.com/neuland-ingolstadt/neuland.app-native/commit/9b60ac49d3a702a1f36c0b4d69aa990e848b52d1))
- _(links)_ Add pressreader link - by @Robert27 ([15e8b9a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/15e8b9a388f25f9123717072aba8c976f51d9034))
- _(localization)_ Add missing error strings for unavailable app icons (german) - by @Robert27 ([1830bc7](https://github.com/neuland-ingolstadt/neuland.app-native/commit/1830bc7eee705e5d04aeb673d816f06ccd98d779))
- _(news)_ Add NewsCard component with carousel - by @Robert27 ([7eeea3f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7eeea3facc0a62eff78902f2332cd14112869f5c))
- _(store)_ Implement Zustand stores for session and route parameters management - by @Robert27 ([bd40f70](https://github.com/neuland-ingolstadt/neuland.app-native/commit/bd40f70bbdaeeb5339a70764c2fd9731fbbe90bd))
- _(timetable)_ Migrate week view to new library - by @Robert27 ([4b2ce49](https://github.com/neuland-ingolstadt/neuland.app-native/commit/4b2ce49650181d18ff7ddcb6e6c680bb2ac1b830))
- _(timetable)_ Add exams to timetable - by @Robert27 ([a767607](https://github.com/neuland-ingolstadt/neuland.app-native/commit/a767607e9952a914bce8af8da39186308e94f1b4))
- _(ui)_ Integrate edge-to-edge layout on android - by @Robert27 ([563f55e](https://github.com/neuland-ingolstadt/neuland.app-native/commit/563f55e5799402a1b999f19d7144ebff218ee1e9))
- Add react native web support ([#141](https://github.com/neuland-ingolstadt/neuland.app-native/issues/141)) - by @Robert27 ([c688528](https://github.com/neuland-ingolstadt/neuland.app-native/commit/c688528d0e7e2a9b018f9362fa746623415841a7))
- Add one and five day timetable layout option ([#155](https://github.com/neuland-ingolstadt/neuland.app-native/issues/155)) - by @Robert27 ([6b119d7](https://github.com/neuland-ingolstadt/neuland.app-native/commit/6b119d70ccfa7a1cf2aba7166a98eb6156eacd86))
- Valid event locations now link to map ([#138](https://github.com/neuland-ingolstadt/neuland.app-native/issues/138)) - by @ManInDark ([2576002](https://github.com/neuland-ingolstadt/neuland.app-native/commit/25760021bfd3c049e3cea16453b0251cbacfe068))

### 🐛 Bug Fixes

- _(about)_ Update logoIcon styles to improve shadow effect - by @Robert27 ([48229da](https://github.com/neuland-ingolstadt/neuland.app-native/commit/48229da6e3c6a41cfb6720742b60b04136ea5e12))
- _(android)_ Fixes laggy navigation bar background logic - by @Robert27 ([fed9727](https://github.com/neuland-ingolstadt/neuland.app-native/commit/fed972752f906251f216d8b9c27ec484d28f826d))
- _(android)_ Remove laggy page transition animations - by @Robert27 ([36c63c6](https://github.com/neuland-ingolstadt/neuland.app-native/commit/36c63c65ceba53a1d37fbe99002eb0c454e000cd))
- _(calendar)_ Enhance exam details display and improve date formatting - by @Robert27 ([3ed2340](https://github.com/neuland-ingolstadt/neuland.app-native/commit/3ed234089150465dfcd55718f227601efc308649))
- _(cards)_ Correct sorting order of active announcements by priority - by @Robert27 ([b853961](https://github.com/neuland-ingolstadt/neuland.app-native/commit/b853961c21e870b36799c37ffd32030229e4093c))
- _(events)_ Update event titles and descriptions structure - by @Robert27 ([4b8ea34](https://github.com/neuland-ingolstadt/neuland.app-native/commit/4b8ea34ce6b0e8677f6fcbcb2c1dbd1d0351b9f0))
- _(events)_ Fix camus life event filtering logic - by @Robert27 ([4e543c1](https://github.com/neuland-ingolstadt/neuland.app-native/commit/4e543c134633dbe2b424d4af86d9b946432c29a2))
- _(food)_ Add bottom padding to allergen and flag selection - by @Robert27 ([a9a720f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/a9a720fc9eb7a63b1be29d39206691189fa1f66f))
- _(food)_ Fix translucent android header bar - by @Robert27 ([932ada9](https://github.com/neuland-ingolstadt/neuland.app-native/commit/932ada9421fa89d7f24dabeefedaa2d25b454f09))
- _(lecture)_ Restore lecture detail navigation - by @Robert27 ([b3b235f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/b3b235f076d29f925ba6b8e54822490dcb498739))
- _(lecture)_ Handle null exam values - by @Robert27 ([4e99ad6](https://github.com/neuland-ingolstadt/neuland.app-native/commit/4e99ad61d0aaddca04b9de88bfbfd6548dc51c21))
- _(lecturers)_ Add SafeAreaView for improved searchbar layout - by @Robert27 ([0258113](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0258113f5810fd854f9ffc5adb08ce4efe6b83ca))
- _(library)_ Correct typo in component name - by @Robert27 ([af943cb](https://github.com/neuland-ingolstadt/neuland.app-native/commit/af943cb3cbaf7645608c7992d441e955f8f0b451))
- _(map)_ Improve color handling for platform compatibility - by @Robert27 ([fb7a950](https://github.com/neuland-ingolstadt/neuland.app-native/commit/fb7a95044887be566d0b91f4eee070bef8640ec4))
- _(map)_ Correct query key for fetching free rooms - by @Robert27 ([e08418a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e08418a6fdf02a5711756955ad418c51336f9868))
- _(map)_ Fix laggy map bottom sheet animation - by @Robert27 ([456a9db](https://github.com/neuland-ingolstadt/neuland.app-native/commit/456a9db68d9248b0b1c14a5ee458ce4a562a2998))
- _(map)_ Room suggestion button not showing on android - by @Robert27 ([bf0dc22](https://github.com/neuland-ingolstadt/neuland.app-native/commit/bf0dc22bf0a3107e135168855cce8f9856b3bb92))
- _(map)_ Conditionally render osm attribution based on map load state - by @Robert27 ([c4a0b70](https://github.com/neuland-ingolstadt/neuland.app-native/commit/c4a0b705b4fddc814d2260203107307294ee554c))
- _(news)_ Update carousel animation and improve layout styles - by @Robert27 ([157b217](https://github.com/neuland-ingolstadt/neuland.app-native/commit/157b217651a97ad911742f692ea961050d96a05b))
- _(rooms)_ Disable map link for invalid rooms - by @Robert27 ([57c0b92](https://github.com/neuland-ingolstadt/neuland.app-native/commit/57c0b92db3a5600adb375d27614b13d19930bee2))
- _(settings)_ Improve loading state handling - by @Robert27 ([8b8fd2f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/8b8fd2f349b50ed6eca21571b294a6cbc28db997))
- _(share)_ Add placeholder button to prevent flicker on load - by @Robert27 ([ddfd014](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ddfd014f71560ba96c0dc8a5873107293e53edbe))
- _(store)_ Add reset functionality to preferences store and streamline initial state setup - by @Robert27 ([fdcc4ee](https://github.com/neuland-ingolstadt/neuland.app-native/commit/fdcc4eef14c2b2e96618cd0a8cb1b112ffd78a38))
- _(tabs)_ Revert android header styles - by @Robert27 ([a180834](https://github.com/neuland-ingolstadt/neuland.app-native/commit/a180834c253b1b85d4c5890e4be456ebb0e0310d))
- _(timetable)_ Add end time for timetable week view - by @Robert27 ([5406bb2](https://github.com/neuland-ingolstadt/neuland.app-native/commit/5406bb2d7f916d34c888f9910485137cb527bd1a))
- _(timetable)_ Ensure current date fallback is correctly set in TimetableWeek component - by @Robert27 ([012b32f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/012b32ff869c24c15701d224a9619dd2583f5a04))
- _(web)_ Enhance styling and add missing icons - by @Robert27 ([a806afb](https://github.com/neuland-ingolstadt/neuland.app-native/commit/a806afb9ea611c45592087eebe7a2e330eb709fb))
- _(web)_ Add navigation buttons for week view - by @Robert27 ([760d2e8](https://github.com/neuland-ingolstadt/neuland.app-native/commit/760d2e8aab85552427b7b1d9f8431605ae6b4804))
- Update Pressable components to use onPressOut for improved touch handling - by @Robert27 ([69d31ff](https://github.com/neuland-ingolstadt/neuland.app-native/commit/69d31ffe2272474e13b740da860b6bbdc922517f))
- On web, do not send user agent to anonymous THI API (because of their CORS policy) - by @M4GNV5 ([1ce6147](https://github.com/neuland-ingolstadt/neuland.app-native/commit/1ce6147da57bcf634a34dbd955fc57dc62358d4a))
- Allow bug reports for web issues - by @M4GNV5 ([5e1204a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/5e1204ad50c4e9ba9603ed03d58c9bc087f889e0))
- Enhance FoodCard to include restaurant location and improve web tab bar styling - by @Robert27 ([e2ce5f7](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e2ce5f7e43eb18456500f45fa2c8f9379d28ab2d))
- Update TypeScript settings, improve layout margins, and enhance localization for events - by @Robert27 ([92e30c7](https://github.com/neuland-ingolstadt/neuland.app-native/commit/92e30c718cbbbf3e26eeb744aef1ac20427368d3))
- Update styles for calendar components and adjust margins in event screens - by @Robert27 ([68656f0](https://github.com/neuland-ingolstadt/neuland.app-native/commit/68656f08e51fd7691dc5d566f9540fb3c8231332))
- Improve filter logic to handle exams correctly - by @Robert27 ([c0f1632](https://github.com/neuland-ingolstadt/neuland.app-native/commit/c0f163248cd6c7fca6edec43bf00d51a18e1f2e4))
- Refactor MealDay component to streamline styles and improve rendering logic - by @Robert27 ([1eaf3a9](https://github.com/neuland-ingolstadt/neuland.app-native/commit/1eaf3a9e7644330c75dde78f4a5f37749c0ce4d7))

### 🚜 Refactor

- _(api)_ Replace graphql-request with fetch for GraphQL queries - by @Robert27 ([967cd79](https://github.com/neuland-ingolstadt/neuland.app-native/commit/967cd799db8fb935efb0a5ac3a5ba89ee0c1e430))
- _(app)_ Enable expo-router typed routes - by @Robert27 ([651ee32](https://github.com/neuland-ingolstadt/neuland.app-native/commit/651ee32fa52f8e0836abad7ab69967d4919b9978))
- _(layout)_ Simplify layout components by removing unnecessary padding and views - by @Robert27 ([7131482](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7131482e5a26a67311dca063bf7154d4b8e7c276))
- _(map)_ Break down into several components - by @Robert27 ([6fa15e3](https://github.com/neuland-ingolstadt/neuland.app-native/commit/6fa15e3512ccba9ae63746a8c6f4f33d245b76c5))
- _(router)_ Replace push with navigate for consistent routing - by @Robert27 ([66be9f2](https://github.com/neuland-ingolstadt/neuland.app-native/commit/66be9f287526d9898d38fcf63a3c522ca31c25a5))

### 📚 Documentation

- Add web specific instructions - by @Robert27 ([c117040](https://github.com/neuland-ingolstadt/neuland.app-native/commit/c117040a66fc99078a5b0ed74fce813f878c44e0))

### ⚡ Performance

- _(app)_ Add Zustand store for route parameters management - by @Robert27 ([534b571](https://github.com/neuland-ingolstadt/neuland.app-native/commit/534b5717e53ccf00a3873c2feba7cd68675e8ab2))
- _(food)_ Improve meal details and share logic - by @Robert27 ([1c2f454](https://github.com/neuland-ingolstadt/neuland.app-native/commit/1c2f4547f5c83054b68ab5fb1dc9fcba01918fe3))
- _(lecturers)_ Replace FlatList with FlashList for improved performance and layout adjustments - by @Robert27 ([979a179](https://github.com/neuland-ingolstadt/neuland.app-native/commit/979a17949241de394561b689ee8bfa1f7a1947af))
- _(navigation)_ Replace InteractionManager with dismissTo for room navigation - by @Robert27 ([7ce4c2a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7ce4c2aab2e13135cec147c5d85c9cb116e01cb4))

### 🎨 Styling

- _(calendar)_ Improves semester dates section name - by @Robert27 ([7422009](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7422009bb7f147e5afdd3cd3dd5a00f8878f90e0))
- _(map)_ Add uniform indicator style for BottomSheet components - by @Robert27 ([3fa68d0](https://github.com/neuland-ingolstadt/neuland.app-native/commit/3fa68d073dd1b2466bb59053b0b6fb1609b01114))
- _(web)_ Improve tabbar styles based on screen width - by @Robert27 ([11b027b](https://github.com/neuland-ingolstadt/neuland.app-native/commit/11b027b5d44a0ca4ffae93ff0c94c4bce6dab4dd))
- Migrate to Unistyles for improved theming and code style ([#119](https://github.com/neuland-ingolstadt/neuland.app-native/issues/119)) - by @Robert27 ([eb33b85](https://github.com/neuland-ingolstadt/neuland.app-native/commit/eb33b85fda148edd76aab84617df97da20037bec))

### ⚙️ Miscellaneous Tasks

- _(changelog)_ Enhance changelog template with remote URL and contributor tracking - by @Robert27 ([b0c1b82](https://github.com/neuland-ingolstadt/neuland.app-native/commit/b0c1b824ad4a20ca0ef0cd4d100feb74ac1194d6))
- _(git)_ Update issue templates - by @Robert27 ([c907232](https://github.com/neuland-ingolstadt/neuland.app-native/commit/c9072328c7b98aa5b43deef4747bdddbaba424e5))
- Upgrade to React Native 0.76 and Expo SDK 52 ([#123](https://github.com/neuland-ingolstadt/neuland.app-native/issues/123)) - by @Robert27 ([ea90005](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ea900052c50347eafdc79fe65f4849415f15fe39))
- Update deployment workflows to specify distinct image names for docs and webapp - by @Robert27 ([c47f73e](https://github.com/neuland-ingolstadt/neuland.app-native/commit/c47f73ef194ee8c392ff1c8d708fa8caae19c68b))
- Update git cliff to remove gitmoji symbols - by @Robert27 ([5c1b26f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/5c1b26f8d72586f032319ff7d744cc397fdec364))
- Update issue templates; remove feature request template - by @Robert27 ([0549f80](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0549f801e205647566965bdd9e9420c41a41a630))
- Update .prettierignore to exclude vitepress docs and generated files - by @Robert27 ([42de524](https://github.com/neuland-ingolstadt/neuland.app-native/commit/42de524c71abfaf1d230f6497762e2dc792a11d8))

### 💚 New Contributors

- @ManInDark made their first contribution in [#138](https://github.com/neuland-ingolstadt/neuland.app-native/pull/138)
- @M4GNV5 made their first contribution

**Full Changelog**: https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.10.1...0.11.0

## [0.10.1](https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.10.0..0.10.1) - 2024-11-09

### 🚀 Features

- _(about)_ Update links and add FAQ section in legal screen - by @Robert27 ([0e887af](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0e887af7cbe992fed3e18d24e00a63840359121c))
- _(calendar)_ Add refresh control to enable exams refetching - by @Robert27 ([89aadf8](https://github.com/neuland-ingolstadt/neuland.app-native/commit/89aadf8ca47372ce4d733908bcea9b60e2006e72))

### 🐛 Bug Fixes

- _(announcements)_ Integrate api changes to fix card display - by @Robert27 ([8cc962d](https://github.com/neuland-ingolstadt/neuland.app-native/commit/8cc962d3ba8b1c14dea2c6b9a6148d0ae8507e7b))
- _(food)_ Correct formatting of restaurant location string - by @Robert27 ([732a7c3](https://github.com/neuland-ingolstadt/neuland.app-native/commit/732a7c340ad51cefeb8f7edf2feb97dd5963a58e))

### 📚 Documentation

- Update setup and features documentation, add changelog section - by @Robert27 ([9b812b5](https://github.com/neuland-ingolstadt/neuland.app-native/commit/9b812b5b187c8ee025c83e887f6b09e034e0bfb3))
- Add edit link and last updated options for documentation pages - by @Robert27 ([4f17acc](https://github.com/neuland-ingolstadt/neuland.app-native/commit/4f17accf5eea0a0933f50548ecfa381536bf27b3))

### ⚙️ Miscellaneous Tasks

- Add changelog and git-cliff configuration - by @Robert27 ([53baf9f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/53baf9f663655de13aec6cc739c68747bd306230))

**Full Changelog**: https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.10.0...0.10.1

## [0.10.0](https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.8.0..0.10.0) - 2024-10-23

### 🚀 Features

- _(analytics)_ Patch aptabase to detect MacOS sessions - by @Robert27 ([ca19292](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ca1929213fde6b845078a6d152d063f0831ab5a8))
- _(app)_ Add university sports and bump version to 0.10.0 ([#109](https://github.com/neuland-ingolstadt/neuland.app-native/issues/109)) - by @Robert27 ([f85d292](https://github.com/neuland-ingolstadt/neuland.app-native/commit/f85d2926357c3f838204aebc6e46143f023ceb19))
- _(foodPreferences)_ Add warning icon to highlight footer text - by @Robert27 ([616df20](https://github.com/neuland-ingolstadt/neuland.app-native/commit/616df20eaf6f1bd6fb96f327493adba9e6535c03))
- _(map)_ Add report issue e-mail link - by @Robert27 ([d193a0c](https://github.com/neuland-ingolstadt/neuland.app-native/commit/d193a0ca79b70fe08a3ea7805c466163d5122ff2))
- _(share)_ Create ShareHeaderButton and add share option to sports event - by @Robert27 ([2d653dc](https://github.com/neuland-ingolstadt/neuland.app-native/commit/2d653dc3ed4a9cc53c441a06413b78261f40067a))

### 🐛 Bug Fixes

- _(grades)_ Add space to ECTS label and handle division by zero in average calculation - by @Robert27 ([838d603](https://github.com/neuland-ingolstadt/neuland.app-native/commit/838d60349f2283de06e875d07f4906ff119cc6d4))
- _(links)_ Add padding to link text and handle undefined quicklinks - by @Robert27 ([e326d37](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e326d379965b5b30aec82f70bdaeca731b28e9ad))
- _(map)_ Map not moving to location marker on unloaded redirect - by @Robert27 ([2240f20](https://github.com/neuland-ingolstadt/neuland.app-native/commit/2240f2080b31565955e658d64178852ccc4f30e5))
- _(map)_ Fix map camera reset after redirect while bottom modal is already open - by @Robert27 ([5835607](https://github.com/neuland-ingolstadt/neuland.app-native/commit/58356073e5c796ee1b4c45dc0c46f6e13cd653ce))
- _(map)_ Add conditionally rendering room availability details for guests - by @Robert27 ([98364ac](https://github.com/neuland-ingolstadt/neuland.app-native/commit/98364acbcd242e7d4f9a235c3ca5ecf92da011f3))
- _(map)_ Next lecture not cleared after logout - by @Robert27 ([ca4f956](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ca4f956cb44ade7a40b4b8f5b3985c1097fdf887))
- _(settings)_ Restrict iOS app icon navigation to non-desktop devices - by @Robert27 ([8c0dc56](https://github.com/neuland-ingolstadt/neuland.app-native/commit/8c0dc56de9382f71c88482e0aba745324af3c6fb))
- _(sports)_ Prevents location buttons from resizing due to their fontweight - by @Robert27 ([8a9bad8](https://github.com/neuland-ingolstadt/neuland.app-native/commit/8a9bad812f6d3d1abbc3ae117a38a044700e955e))
- _(theme)_ Accent color picker not displaying default color - by @Robert27 ([9564895](https://github.com/neuland-ingolstadt/neuland.app-native/commit/9564895cf2364a439b7be69053fb1279eeda15e4))
- _(timetable)_ Initial timetable card loading - by @Robert27 ([93cd623](https://github.com/neuland-ingolstadt/neuland.app-native/commit/93cd62380d232c031f8dc012898030275df4bf84))

### 📚 Documentation

- Update app documentation - by @Robert27 ([54b5988](https://github.com/neuland-ingolstadt/neuland.app-native/commit/54b598897284b8ce891cd0788fca5c37926fcea6))

### ⚡ Performance

- _(app)_ Various minor improvements for 0.10 ([#114](https://github.com/neuland-ingolstadt/neuland.app-native/issues/114)) - by @Robert27 ([cd6d11a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/cd6d11aa9bf365b6448a994b4b1a271e9d62a9d2))
- _(dashboard)_ Improve card visibility logic and update state management - by @Robert27 ([e6fbd79](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e6fbd79d1524dc66f3b463b138585c199ad6a02d))

### 🎨 Styling

- _(app)_ Fixes various styling issues - by @Robert27 ([e77c58a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e77c58a68715562ef4808419173ed6b25c66a97c))
- _(meal)_ Moves share button to header - by @Robert27 ([59d6b53](https://github.com/neuland-ingolstadt/neuland.app-native/commit/59d6b534782e063b2eaf740cdc8e769883a254cc))

### ⚙️ Miscellaneous Tasks

- _(linting)_ Add configuration for commit message linting - by @Robert27 ([e1ba7a5](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e1ba7a557ef7b517f0dcc757ace9e758667a56bf))

**Full Changelog**: https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.8.0...0.10.0

## [0.7.0] - 2024-06-15

### 🚀 Features

- _(app)_ Linting, types and custom components ([#4](https://github.com/neuland-ingolstadt/neuland.app-native/issues/4)) - by @Robert27 ([f62e69e](https://github.com/neuland-ingolstadt/neuland.app-native/commit/f62e69efb2218e3ca0e9b5ab6885860c6deeccd1))
- _(dashboard)_ Adds cards and pages ([#9](https://github.com/neuland-ingolstadt/neuland.app-native/issues/9)) - by @Robert27 ([3e2b58c](https://github.com/neuland-ingolstadt/neuland.app-native/commit/3e2b58c492097074a2c221b5806064fed9b02d99))
- _(food)_ Adds food page ([#5](https://github.com/neuland-ingolstadt/neuland.app-native/issues/5)) - by @Robert27 ([c1e4f56](https://github.com/neuland-ingolstadt/neuland.app-native/commit/c1e4f563978b602c496ecb75de11785a4404a17e))
- _(map)_ Adds campus map ([#7](https://github.com/neuland-ingolstadt/neuland.app-native/issues/7)) - by @Robert27 ([0560cc3](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0560cc392c7cacb4a2fb93a9dab38847e561d65f))
- _(theme)_ Adds accent colors and themes ([#6](https://github.com/neuland-ingolstadt/neuland.app-native/issues/6)) - by @Robert27 ([93de08a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/93de08a83084c6e5798fdcc23fd0b09675dc8a49))

### 💚 New Contributors

- @Robert27 made their first contribution
- @FelixDoubleu made their first contribution in [#92](https://github.com/neuland-ingolstadt/neuland.app-native/pull/92)
- @pl0ss made their first contribution in [#91](https://github.com/neuland-ingolstadt/neuland.app-native/pull/91)
- @BuildmodeOne made their first contribution in [#74](https://github.com/neuland-ingolstadt/neuland.app-native/pull/74)
- @MatthiasRaimann made their first contribution in [#63](https://github.com/neuland-ingolstadt/neuland.app-native/pull/63)
- @alexhorn made their first contribution in [#41](https://github.com/neuland-ingolstadt/neuland.app-native/pull/41)
- @bee1850 made their first contribution in [#27](https://github.com/neuland-ingolstadt/neuland.app-native/pull/27)

<!-- generated by git-cliff -->
