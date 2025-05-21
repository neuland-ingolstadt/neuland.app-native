# Setup Development Environment

::: tip Tip

The following section describes the setup process for the native app development environment, as it is the main focus of the project.
For testing purposes or web-only bug fixing, we recommend using the more lightweight [web development environment](/en/app/setup-web).

:::

## Prerequisites

1.  Fork the repository and clone it to your local machine.
2.  Install the required software:

    - [Visual Studio Code](https://code.visualstudio.com/)
    - [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12) (for iOS development, macOS only)
    - [Android Studio](https://developer.android.com/studio) (for Android development)

3.  Install the required dependencies:

    - [Node.js](https://nodejs.org/en/) 22 LTS or higher
    - [Git LFS](https://git-lfs.github.com/)
    - [Bun](https://bun.sh) or use npm if you dont't change dependencies
    - [Watchman](https://facebook.github.io/watchman/docs/install) (for Linux or macOS users)

4.  In addition is recommended to use the [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) extension for your IDE to get real-time feedback on your code.

5.  Install project dependencies by running the following command in the project directory:

    ```sh
    bun install
    ```

6.  Setup the emulator

    Android (_Windows, macOS, and Linux_):

    - Follow the [official guide](https://docs.expo.dev/workflow/android-studio-emulator/) to set up the Android emulator.

    iOS (_macOS only_):

    - Follow the [official guide](https://docs.expo.dev/workflow/ios-simulator/) to set up the iOS simulator.

7.  Copy the `.env.local.example` file to `.env.local` and fill in the variables.
    \
    See the [notes](/app/contribute#developer) on the API key.

```env
EXPO_PUBLIC_THI_API_KEY=abc123  // [!code --]
EXPO_PUBLIC_THI_API_KEY=SUPER_SECRET_API_KEY  // [!code ++]
```

8.  Create a development build for your desired platform.

    ```sh
    bun ios
    bun android
    ```

::: warning Note

Step 8 is required every time the dependencies are updated.

:::

## Development

1. Create a new branch from your fork to contribute to the project. Use a descriptive branch name.
2. Make your changes and ensure that the code follows our coding style and conventions.
3. Run the app locally with Expo by running the following command in the project directory:

   ```sh
   bun dev
   ```

   This allows you to run the app one the previously created development build. Expo Go is not supported for development.

## Submitting Changes

1. Commit your changes to your branch. To ensure descriptive commit messages and automatic changelog generation, we require using the Angular commit message style for your commit messages.
2. Create a pull request from your branch to the develop branch of this repository.
3. Provide a clear and descriptive title and description for your pull request, summarizing the changes you made. Also make sure use the Angular commit message style for the pull request title.
4. Once your pull request is submitted, our team will review your changes and provide feedback or request further modifications if needed.

::: details Details on the Angular commit message style

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|
  │                          elements|forms|http|language-service|localize|platform-browser|
  │                          platform-browser-dynamic|platform-server|router|service-worker|
  │                          upgrade|zone.js|packaging|changelog|docs-infra|migrations|
  │                          devtools
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

:::

## Code Style

- Follow the existing code style and conventions used in the project.
- Use meaningful variable and function names to improve code readability.
- Document your code when necessary using inline comments.

- Follow the existing code style and conventions used in the project.
- Use meaningful variable and function names to improve code readability.
- Document your code when necessary using inline comments.

You can use the following commands to check and format the code:

- `bun lint` to check for linting errors
- `bun format` to format the code using Biome

## Issues and Discussions

- Feel free to open an issue if you encounter a bug or want to suggest an improvement.
- For questions or more general concerns, create a thread in the discussion tab.
