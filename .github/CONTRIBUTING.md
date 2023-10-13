# Contributing to neuland.app-native

Thank you for considering contributing to neuland.app-native!

To contribute, please follow these guidelines:

## Getting Started

1. Fork the repository and clone it to your local machine.
2. Install the required dependencies:

-   [Node.js 18 LTS](https://nodejs.org/en/) or higher
-   [Yarn](https://docs.expo.dev/get-started/installation/)
-   [Watchman](https://facebook.github.io/watchman/docs/install) (for Linux or macOS users)

3. Install project dependencies by running the following command in the project directory:

    ```bash
    yarn install
    ```

4. In addition is recommended to use the ESLint and Prettier extensions for your IDE to get real-time feedback on your code.

## Development

1. Create a new branch from your fork to contribute to the project. Use a descriptive branch name.
2. Make your changes and ensure that the code follows our coding style and conventions.
3. Run the app locally with Expo by running the following command in the project directory:
    ```bash
    yarn start
    ```
    > This allows you to test the app either on an installed simulator or with the Expo Go app on your own smartphone.

## Submitting Changes

1. Commit your changes to your branch. To ensure descriptive commit messages, we recommend using the
 [Angular commit message style](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit-message-header) for your commit messages.
1. Create a pull request from your branch to the develop branch of this repository.
1. Provide a clear and descriptive title and description for your pull request, summarizing the changes you made.
1. Once your pull request is submitted, our team will review your changes and provide feedback or request further modifications if needed.

<details>

  <summary>Details on the Angular commit message style</summary>

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

</details>

## Code Style

-   Follow the existing code style and conventions used in the project.
-   Use meaningful variable and function names to improve code readability.
-   Document your code when necessary using inline comments.

-   Follow the existing code style and conventions used in the project.
-   Use meaningful variable and function names to improve code readability.
-   Document your code when necessary using inline comments.

We use the **Husky** git hook to automatically fix commits according to ESLint rules and format them using Prettier.
But you can also run these commands manually:

-   `yarn lint` to check for linting errors
-   `yarn lint:fix` to automatically fix linting errors
-   `yarn format` to format the code using Prettier


## Issues and Discussions

-   Feel free to open an issue if you encounter a bug or want to suggest an improvement.
-   For questions or more general concerns, create a thread in the discussion tab.
