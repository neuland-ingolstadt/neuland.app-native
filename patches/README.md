# Native compatibility patches

## swiftui-react-native 6.3.3

`swiftui-react-native@6.3.3.patch` is required to compile this dependency with
Expo SDK 56 and React Native 0.85. Its container views override
`didUpdateReactSubviews()` and call `reactSubviews()`, but the SDK 56 `ExpoView`
base class no longer provides those APIs. The resulting Swift errors include
“method does not override any method from its superclass” and “has no member
'reactSubviews'”. All native source files in the dependency compile even though
the app only uses its picker, toggle, and binding APIs.

The patch introduces a shared `SwiftUIReactView` base class that tracks React
children through Fabric's mount and unmount callbacks. Container views update
their SwiftUI props from that list. Nested menu/list traversal uses the tracked
children for patched views and UIKit subviews for other views. Keeping an explicit
React-child list avoids including a container's own hosting-controller view.

This is a local compatibility patch, not an upstream fix. The upgrade's saved
iOS Release simulator build succeeded with it; that build result does not verify
interactive behavior. Exercise the room-search picker and single-section picker
toggles on iOS, including changing selections and reopening their screens. Any
future use of the patched containers also needs child insertion/removal checks.

Remove the patch when an upstream release supports the SDK's Fabric child
lifecycle, or when the app no longer depends on this package. Remove its
`package.json` `patchedDependencies` entry at the same time, regenerate `bun.lock`
with Bun, and verify a clean iOS build plus the affected controls. Until then,
include this patch file when committing the SDK upgrade.
