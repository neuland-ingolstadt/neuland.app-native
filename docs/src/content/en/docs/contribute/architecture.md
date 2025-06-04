# Architecture

The Neuland Next ecosystem consists of several components that work together to provide a seamless experience for users. The architecture is designed to be modular and scalable, allowing for easy integration of new features and improvements over time.

## Architecture Scheme

![Neuland Next Architecture](/assets/architecture.webp)

## Components

- **neuland.app-native**: The core mobile application "Neuland Next" built with React Native. It serves as the main interface for users to access various features and functionalities.
- **neuland.app-backend**: The backend server that orchestrates multiple data sources and microservices to provide a unified GraphQL API for the mobile app. Canteens, campus events, university sports and other data sources are integrated into this backend either directly or via database.
- **neuland.app-dashboard**: The web-based dashboard for administrators to manage the custom data sources. It provides a user-friendly interface for adding, updating, and deleting data that is displayed in the mobile app, such as announcements or manual campus events.
- **THI-API**: The official API provided by the Technische Hochschule Ingolstadt (THI) for accessing university-related data. This API is only used by the mobile app to maximize security and privacy.
- **Neuland GeoServer**: A custom vector tile server that provides map tiles and styles for the campus map feature in the mobile app. It also provides the GeoJSON for the rooms overlay.
- **Analytics Server**: To collect the anonymized usage data of the app, we use a self-hosted Aptabase Analytics server. This server is not connected to the backend and uses Clickhouse as a performant database.
