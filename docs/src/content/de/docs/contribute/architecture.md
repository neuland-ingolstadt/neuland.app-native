# Architektur

Das Neuland Next Ökosystem besteht aus mehreren Komponenten, die zusammenarbeiten, um ein nahtloses Erlebnis für die Nutzer zu schaffen. Die Architektur ist modular und skalierbar gestaltet, sodass neue Funktionen und Verbesserungen im Laufe der Zeit einfach integriert werden können.

## Architektur-Schema

![Neuland Next Architektur](/assets/architecture.webp)

## Komponenten

- **neuland.app-native**: Die Kern-Mobile-Anwendung "Neuland Next", entwickelt mit React Native. Sie dient als Hauptbenutzeroberfläche für Nutzer, um auf verschiedene Funktionen und Eigenschaften zuzugreifen.
- **neuland.app-backend**: Der Backend-Server, der mehrere Datenquellen und Microservices orchestriert, um eine einheitliche GraphQL-API für die mobile App bereitzustellen. Mensen, Campus-Events, Hochschulsport und andere Datenquellen werden entweder direkt oder über eine Datenbank in dieses Backend integriert.
- **neuland.app-dashboard**: Das webbasierte Dashboard für Administratoren zur Verwaltung der benutzerdefinierten Datenquellen. Es bietet eine benutzerfreundliche Oberfläche zum Hinzufügen, Aktualisieren und Löschen von Daten, die in der mobilen App angezeigt werden, wie z.B. Ankündigungen oder manuelle Campus-Events.
- **THI-API**: Die offizielle API der Technischen Hochschule Ingolstadt (THI) für den Zugriff auf hochschulbezogene Daten. Diese API wird nur von der mobilen App genutzt, um maximale Sicherheit und Datenschutz zu gewährleisten.
- **Neuland GeoServer**: Ein eigener Vector-Tile-Server, der Kartenkacheln und Stile für die Campus-Kartenfunktion in der mobilen App bereitstellt. Er liefert auch die GeoJSON-Daten für das Raum-Overlay.
- **Analytics Server**: Zum Sammeln der anonymisierten Nutzungsdaten der App verwenden wir einen selbst gehosteten Aptabase Analytics-Server. Dieser Server ist nicht mit dem Backend verbunden und verwendet Clickhouse als performante Datenbank.
