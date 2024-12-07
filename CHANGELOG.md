# Changelog

All notable changes to this project will be documented in this file.

## [unreleased]

### 🚀 Features

-   _(api)_ Add GraphQL code generation (#130) - by @Robert27 in [#130](https://github.com/neuland-ingolstadt/neuland.app-native/pull/130) ([e824635](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e824635ab1d4dd6104ee6d5f0c7fcb27758b1dee))
-   _(api)_ Extend announcement popup with platform and userKind filter - by @Robert27 ([918026c](https://github.com/neuland-ingolstadt/neuland.app-native/commit/918026cea7faa694097deb1c9496cf19d4b00cbe))
-   _(app)_ Enable react native new arch (#131) - by @Robert27 in [#131](https://github.com/neuland-ingolstadt/neuland.app-native/pull/131) ([5f143fd](https://github.com/neuland-ingolstadt/neuland.app-native/commit/5f143fda6487d088c74bfa0ab582b2f237161477))
-   _(error)_ Include current pathname in feedback email content - by @Robert27 ([442b861](https://github.com/neuland-ingolstadt/neuland.app-native/commit/442b86160993a2b80f08ca8ae3f26d935b5ce6d7))
-   _(events)_ Replace static club data with api data - by @Robert27 ([a17bd68](https://github.com/neuland-ingolstadt/neuland.app-native/commit/a17bd68ca25e3a2d043adf310f32ac45829dee70))
-   _(grades, profile)_ Add app state handling for privacy visibility - by @Robert27 ([7e4b463](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7e4b463425d2da5fccd6bf3745fa40361553b755))
-   _(news)_ Add NewsCard component with carousel - by @Robert27 ([7eeea3f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7eeea3facc0a62eff78902f2332cd14112869f5c))
-   _(ui)_ Integrate edge-to-edge layout on android - by @Robert27 ([563f55e](https://github.com/neuland-ingolstadt/neuland.app-native/commit/563f55e5799402a1b999f19d7144ebff218ee1e9))

### 🐛 Bug Fixes

-   _(about)_ Update logoIcon styles to improve shadow effect - by @Robert27 ([48229da](https://github.com/neuland-ingolstadt/neuland.app-native/commit/48229da6e3c6a41cfb6720742b60b04136ea5e12))
-   _(android)_ Fixes laggy navigation bar background logic - by @Robert27 ([fed9727](https://github.com/neuland-ingolstadt/neuland.app-native/commit/fed972752f906251f216d8b9c27ec484d28f826d))
-   _(android)_ Remove laggy page transition animations - by @Robert27 ([36c63c6](https://github.com/neuland-ingolstadt/neuland.app-native/commit/36c63c65ceba53a1d37fbe99002eb0c454e000cd))
-   _(calendar)_ Enhance exam details display and improve date formatting - by @Robert27 ([3ed2340](https://github.com/neuland-ingolstadt/neuland.app-native/commit/3ed234089150465dfcd55718f227601efc308649))
-   _(cards)_ Correct sorting order of active announcements by priority - by @Robert27 ([b853961](https://github.com/neuland-ingolstadt/neuland.app-native/commit/b853961c21e870b36799c37ffd32030229e4093c))
-   _(events)_ Update event titles and descriptions structure - by @Robert27 ([4b8ea34](https://github.com/neuland-ingolstadt/neuland.app-native/commit/4b8ea34ce6b0e8677f6fcbcb2c1dbd1d0351b9f0))
-   _(lecture)_ Restore lecture detail navigation - by @Robert27 ([b3b235f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/b3b235f076d29f925ba6b8e54822490dcb498739))
-   _(lecture)_ Handle null exam values - by @Robert27 ([4e99ad6](https://github.com/neuland-ingolstadt/neuland.app-native/commit/4e99ad61d0aaddca04b9de88bfbfd6548dc51c21))
-   _(lecturers)_ Add SafeAreaView for improved searchbar layout - by @Robert27 ([0258113](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0258113f5810fd854f9ffc5adb08ce4efe6b83ca))
-   _(map)_ Improve color handling for platform compatibility - by @Robert27 ([fb7a950](https://github.com/neuland-ingolstadt/neuland.app-native/commit/fb7a95044887be566d0b91f4eee070bef8640ec4))
-   _(map)_ Correct query key for fetching free rooms - by @Robert27 ([e08418a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e08418a6fdf02a5711756955ad418c51336f9868))
-   _(map)_ Fix laggy map bottom sheet animation - by @Robert27 ([456a9db](https://github.com/neuland-ingolstadt/neuland.app-native/commit/456a9db68d9248b0b1c14a5ee458ce4a562a2998))
-   _(rooms)_ Disable map link for invalid rooms - by @Robert27 ([57c0b92](https://github.com/neuland-ingolstadt/neuland.app-native/commit/57c0b92db3a5600adb375d27614b13d19930bee2))
-   _(settings)_ Improve loading state handling - by @Robert27 ([8b8fd2f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/8b8fd2f349b50ed6eca21571b294a6cbc28db997))
-   _(share)_ Add placeholder button to prevent flicker on load - by @Robert27 ([ddfd014](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ddfd014f71560ba96c0dc8a5873107293e53edbe))

### 🚜 Refactor

-   _(api)_ Replace graphql-request with fetch for GraphQL queries - by @Robert27 ([967cd79](https://github.com/neuland-ingolstadt/neuland.app-native/commit/967cd799db8fb935efb0a5ac3a5ba89ee0c1e430))
-   _(app)_ Enable expo-router typed routes - by @Robert27 ([651ee32](https://github.com/neuland-ingolstadt/neuland.app-native/commit/651ee32fa52f8e0836abad7ab69967d4919b9978))
-   _(layout)_ Simplify layout components by removing unnecessary padding and views - by @Robert27 ([7131482](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7131482e5a26a67311dca063bf7154d4b8e7c276))
-   _(map)_ Break down into several components - by @Robert27 ([6fa15e3](https://github.com/neuland-ingolstadt/neuland.app-native/commit/6fa15e3512ccba9ae63746a8c6f4f33d245b76c5))

### ⚡ Performance

-   _(lecturers)_ Replace FlatList with FlashList for improved performance and layout adjustments - by @Robert27 ([979a179](https://github.com/neuland-ingolstadt/neuland.app-native/commit/979a17949241de394561b689ee8bfa1f7a1947af))
-   _(navigation)_ Replace InteractionManager with dismissTo for room navigation - by @Robert27 ([7ce4c2a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7ce4c2aab2e13135cec147c5d85c9cb116e01cb4))

### 🎨 Styling

-   _(calendar)_ Improves semester dates section name - by @Robert27 ([7422009](https://github.com/neuland-ingolstadt/neuland.app-native/commit/7422009bb7f147e5afdd3cd3dd5a00f8878f90e0))
-   _(map)_ Add uniform indicator style for BottomSheet components - by @Robert27 ([3fa68d0](https://github.com/neuland-ingolstadt/neuland.app-native/commit/3fa68d073dd1b2466bb59053b0b6fb1609b01114))
-   Migrate to Unistyles for improved theming and code style (#119) - by @Robert27 in [#119](https://github.com/neuland-ingolstadt/neuland.app-native/pull/119) ([eb33b85](https://github.com/neuland-ingolstadt/neuland.app-native/commit/eb33b85fda148edd76aab84617df97da20037bec))

### ⚙️ Miscellaneous Tasks

-   _(changelog)_ Enhance changelog template with remote URL and contributor tracking - ([4099d8a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/4099d8afa6107665aacddb4c19d5e5f35e971fe2))
-   _(git)_ Update issue templates - by @Robert27 ([c907232](https://github.com/neuland-ingolstadt/neuland.app-native/commit/c9072328c7b98aa5b43deef4747bdddbaba424e5))
-   Upgrade to React Native 0.76 and Expo SDK 52 (#123) - by @Robert27 in [#123](https://github.com/neuland-ingolstadt/neuland.app-native/pull/123) ([ea90005](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ea900052c50347eafdc79fe65f4849415f15fe39))

## [0.10.1](https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.10.0..0.10.1) - 2024-11-09

### 🚀 Features

-   _(about)_ Update links and add FAQ section in legal screen - by @Robert27 ([0e887af](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0e887af7cbe992fed3e18d24e00a63840359121c))
-   _(calendar)_ Add refresh control to enable exams refetching - by @Robert27 ([89aadf8](https://github.com/neuland-ingolstadt/neuland.app-native/commit/89aadf8ca47372ce4d733908bcea9b60e2006e72))

### 🐛 Bug Fixes

-   _(announcements)_ Integrate api changes to fix card display - by @Robert27 ([8cc962d](https://github.com/neuland-ingolstadt/neuland.app-native/commit/8cc962d3ba8b1c14dea2c6b9a6148d0ae8507e7b))
-   _(food)_ Correct formatting of restaurant location string - by @Robert27 ([732a7c3](https://github.com/neuland-ingolstadt/neuland.app-native/commit/732a7c340ad51cefeb8f7edf2feb97dd5963a58e))

### 📚 Documentation

-   Update setup and features documentation, add changelog section - by @Robert27 ([9b812b5](https://github.com/neuland-ingolstadt/neuland.app-native/commit/9b812b5b187c8ee025c83e887f6b09e034e0bfb3))
-   Add edit link and last updated options for documentation pages - by @Robert27 ([4f17acc](https://github.com/neuland-ingolstadt/neuland.app-native/commit/4f17accf5eea0a0933f50548ecfa381536bf27b3))

### ⚙️ Miscellaneous Tasks

-   Add changelog and git-cliff configuration - by @Robert27 ([53baf9f](https://github.com/neuland-ingolstadt/neuland.app-native/commit/53baf9f663655de13aec6cc739c68747bd306230))

**Full Changelog**: https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.10.0...0.10.1

## [0.10.0](https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.8.0..0.10.0) - 2024-10-23

### 🚀 Features

-   _(analytics)_ Patch aptabase to detect MacOS sessions - by @Robert27 ([ca19292](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ca1929213fde6b845078a6d152d063f0831ab5a8))
-   _(app)_ Add university sports and bump version to 0.10.0 (#109) - by @Robert27 ([f85d292](https://github.com/neuland-ingolstadt/neuland.app-native/commit/f85d2926357c3f838204aebc6e46143f023ceb19))
-   _(foodPreferences)_ Add warning icon to highlight footer text - by @Robert27 ([616df20](https://github.com/neuland-ingolstadt/neuland.app-native/commit/616df20eaf6f1bd6fb96f327493adba9e6535c03))
-   _(map)_ Add report issue e-mail link - by @Robert27 ([d193a0c](https://github.com/neuland-ingolstadt/neuland.app-native/commit/d193a0ca79b70fe08a3ea7805c466163d5122ff2))
-   _(share)_ Create ShareHeaderButton and add share option to sports event - by @Robert27 ([2d653dc](https://github.com/neuland-ingolstadt/neuland.app-native/commit/2d653dc3ed4a9cc53c441a06413b78261f40067a))

### 🐛 Bug Fixes

-   _(grades)_ Add space to ECTS label and handle division by zero in average calculation - by @Robert27 ([838d603](https://github.com/neuland-ingolstadt/neuland.app-native/commit/838d60349f2283de06e875d07f4906ff119cc6d4))
-   _(links)_ Add padding to link text and handle undefined quicklinks - by @Robert27 ([e326d37](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e326d379965b5b30aec82f70bdaeca731b28e9ad))
-   _(map)_ Map not moving to location marker on unloaded redirect - by @Robert27 ([2240f20](https://github.com/neuland-ingolstadt/neuland.app-native/commit/2240f2080b31565955e658d64178852ccc4f30e5))
-   _(map)_ Fix map camera reset after redirect while bottom modal is already open - by @Robert27 ([5835607](https://github.com/neuland-ingolstadt/neuland.app-native/commit/58356073e5c796ee1b4c45dc0c46f6e13cd653ce))
-   _(map)_ Add conditionally rendering room availability details for guests - by @Robert27 ([98364ac](https://github.com/neuland-ingolstadt/neuland.app-native/commit/98364acbcd242e7d4f9a235c3ca5ecf92da011f3))
-   _(map)_ Next lecture not cleared after logout - by @Robert27 ([ca4f956](https://github.com/neuland-ingolstadt/neuland.app-native/commit/ca4f956cb44ade7a40b4b8f5b3985c1097fdf887))
-   _(settings)_ Restrict iOS app icon navigation to non-desktop devices - by @Robert27 ([8c0dc56](https://github.com/neuland-ingolstadt/neuland.app-native/commit/8c0dc56de9382f71c88482e0aba745324af3c6fb))
-   _(sports)_ Prevents location buttons from resizing due to their fontweight - by @Robert27 ([8a9bad8](https://github.com/neuland-ingolstadt/neuland.app-native/commit/8a9bad812f6d3d1abbc3ae117a38a044700e955e))
-   _(theme)_ Accent color picker not displaying default color - by @Robert27 ([9564895](https://github.com/neuland-ingolstadt/neuland.app-native/commit/9564895cf2364a439b7be69053fb1279eeda15e4))
-   _(timetable)_ Initial timetable card loading - by @Robert27 ([93cd623](https://github.com/neuland-ingolstadt/neuland.app-native/commit/93cd62380d232c031f8dc012898030275df4bf84))

### 📚 Documentation

-   Update app documentation - by @Robert27 ([54b5988](https://github.com/neuland-ingolstadt/neuland.app-native/commit/54b598897284b8ce891cd0788fca5c37926fcea6))

### ⚡ Performance

-   _(app)_ Various minor improvements for 0.10 (#114) - by @Robert27 in [#114](https://github.com/neuland-ingolstadt/neuland.app-native/pull/114) ([cd6d11a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/cd6d11aa9bf365b6448a994b4b1a271e9d62a9d2))
-   _(dashboard)_ Improve card visibility logic and update state management - by @Robert27 ([e6fbd79](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e6fbd79d1524dc66f3b463b138585c199ad6a02d))

### 🎨 Styling

-   _(app)_ Fixes various styling issues - by @Robert27 ([e77c58a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e77c58a68715562ef4808419173ed6b25c66a97c))
-   _(meal)_ Moves share button to header - by @Robert27 ([59d6b53](https://github.com/neuland-ingolstadt/neuland.app-native/commit/59d6b534782e063b2eaf740cdc8e769883a254cc))

### ⚙️ Miscellaneous Tasks

-   _(linting)_ Add configuration for commit message linting - by @Robert27 ([e1ba7a5](https://github.com/neuland-ingolstadt/neuland.app-native/commit/e1ba7a557ef7b517f0dcc757ace9e758667a56bf))

**Full Changelog**: https://github.com/neuland-ingolstadt/neuland.app-native/compare/0.8.0...0.10.0

## [0.7.0] - 2024-06-15

### 🚀 Features

-   _(app)_ Linting, types and custom components (#4) - by @Robert27 ([f62e69e](https://github.com/neuland-ingolstadt/neuland.app-native/commit/f62e69efb2218e3ca0e9b5ab6885860c6deeccd1))
-   _(dashboard)_ Adds cards and pages (#9) - by @Robert27 in [#9](https://github.com/neuland-ingolstadt/neuland.app-native/pull/9) ([3e2b58c](https://github.com/neuland-ingolstadt/neuland.app-native/commit/3e2b58c492097074a2c221b5806064fed9b02d99))
-   _(food)_ Adds food page (#5) - by @Robert27 in [#5](https://github.com/neuland-ingolstadt/neuland.app-native/pull/5) ([c1e4f56](https://github.com/neuland-ingolstadt/neuland.app-native/commit/c1e4f563978b602c496ecb75de11785a4404a17e))
-   _(map)_ Adds campus map (#7) - by @Robert27 in [#7](https://github.com/neuland-ingolstadt/neuland.app-native/pull/7) ([0560cc3](https://github.com/neuland-ingolstadt/neuland.app-native/commit/0560cc392c7cacb4a2fb93a9dab38847e561d65f))
-   _(theme)_ Adds accent colors and themes (#6) - by @Robert27 in [#6](https://github.com/neuland-ingolstadt/neuland.app-native/pull/6) ([93de08a](https://github.com/neuland-ingolstadt/neuland.app-native/commit/93de08a83084c6e5798fdcc23fd0b09675dc8a49))

### 💚 New Contributors

-   @Robert27 made their first contribution
-   @FelixDoubleu made their first contribution in [#92](https://github.com/neuland-ingolstadt/neuland.app-native/pull/92)
-   @pl0ss made their first contribution in [#91](https://github.com/neuland-ingolstadt/neuland.app-native/pull/91)
-   @BuildmodeOne made their first contribution in [#74](https://github.com/neuland-ingolstadt/neuland.app-native/pull/74)
-   @MatthiasRaimann made their first contribution in [#63](https://github.com/neuland-ingolstadt/neuland.app-native/pull/63)
-   @alexhorn made their first contribution in [#41](https://github.com/neuland-ingolstadt/neuland.app-native/pull/41)
-   @bee1850 made their first contribution in [#27](https://github.com/neuland-ingolstadt/neuland.app-native/pull/27)

<!-- generated by git-cliff -->
