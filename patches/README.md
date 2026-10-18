# Native compatibility patches

## getenv 1.0.0

`getenv@1.0.0.patch` is required for compatibility with the current Expo / Metro toolchain. Remove the patch and its `patchedDependencies` entry together when upstream no longer needs it.

## react-native-wallet-manager 2.1.0

`react-native-wallet-manager@2.1.0.patch` replaces the removed `currentActivity` property with
`reactApplicationContext.currentActivity` so the Android module compiles on React Native 0.81+.
Remove the patch and its `patchedDependencies` entry together when upgrading to 2.2.0+ (blocked by
`minimumReleaseAge` until ~2026-10-19).
