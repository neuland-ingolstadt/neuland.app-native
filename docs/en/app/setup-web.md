# Setup Web Development Environment

::: warning Info

The following section describes the lightweight setup process for the web app, which allows faster development and testing.
For native features and not web related bug fixes, refer to the [full setup guide](/en/app/setup), which includes the setup of the mobile app environment.

:::

## Prerequisites

1.  Fork the repository and clone it to your local machine.
2.  Install the required software:

    - [Visual Studio Code](https://code.visualstudio.com/)

3.  Install the required dependencies:

    - [Node.js](https://nodejs.org/en/) 22 LTS or higher
    - [Bun](https://bun.sh) or use npm if you dont't change dependencies
    - [Watchman](https://facebook.github.io/watchman/docs/install) (for Linux or macOS users)

4.  In addition is recommended to use the [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) extension for your IDE to get real-time feedback on your code.

5.  Install project dependencies by running the following command in the project directory:

    ```sh
    bun install
    ```

6.  Copy the `.env.local.example` file to `.env.local` and fill in the variables.
    \
    See the [notes](/app/contribute#developer) on the API key.

```env
EXPO_PUBLIC_THI_API_KEY=abc123  // [!code --]
EXPO_PUBLIC_THI_API_KEY=SUPER_SECRET_API_KEY  // [!code ++]
```

## Development

1. Create a new branch from your fork to contribute to the project. Use a descriptive branch name.
2. Make your changes and ensure that the code follows our coding style and conventions.
3. Run the app locally with Expo by running the following command in the project directory:

   ```sh
   bun web
   ```

::: info Info

Detailed information about contributing to the project and the code style can be found in the
[full setup guide](/en/app/setup#submitting-changes).

:::
