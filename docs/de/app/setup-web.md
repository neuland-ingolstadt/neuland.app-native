# Entwicklungsumgebung einrichten

::: warning Hinweis

Die folgende Sektion beschreibt den leichtgewichtigen Einrichtungsprozess für die Web-App, der eine schnellere Entwicklung und Tests ermöglicht.
Für native Funktionen und nicht webbezogene Fehlerbehebungen, siehe den [vollständigen Einrichtungsleitfaden](/app/setup), der die Einrichtung der mobilen App-Umgebung beinhaltet.

:::

## Voraussetzungen

1. Forke das Repository und klone es auf deinen lokalen Rechner.
2. Installiere die erforderliche Software:

   - [Visual Studio Code](https://code.visualstudio.com/)
   - [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12) (für iOS-Entwicklung, nur macOS)
   - [Android Studio](https://developer.android.com/studio) (für Android-Entwicklung)

3. Installiere die benötigten Abhängigkeiten:

   - [Node.js](https://nodejs.org/en/) 22 LTS oder höher
   - [Bun](https://bun.sh) oder nutze npm, wenn du die Abhängigkeiten nicht änderst
   - [Watchman](https://facebook.github.io/watchman/docs/install) (für Linux- oder macOS-Nutzer)

4. Es wird empfohlen, die [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) Erweiterung für deine IDE zu verwenden, um Echtzeit-Feedback zu deinem Code zu erhalten.

5. Installiere die Projektabhängigkeiten, indem du den folgenden Befehl im Projektverzeichnis ausführst:

   ```sh
   bun install
   ```

6. Kopiere die `.env.local.example` Datei in `.env.local` und fülle die Variablen aus.
   \
   Siehe die [Hinweise](/app/contribute#entwickler) zum API-Schlüssel.

```env
EXPO_PUBLIC_THI_API_KEY=abc123  // [!code --]
EXPO_PUBLIC_THI_API_KEY=SUPER_SECRET_API_KEY  // [!code ++]
```

## Entwicklung

1. Erstelle einen neuen Branch von deinem Fork, um zum Projekt beizutragen. Verwende einen beschreibenden Branch-Namen.
2. Mache deine Änderungen und stelle sicher, dass der Code unserem Coding-Stil und den Konventionen folgt.
3. Starte die App lokal mit Expo, indem du folgenden Befehl im Projektverzeichnis ausführst:

   ```sh
   bun web
   ```

::: info Info

Detailierte Informationen zum Beitragen am Projekt und zum Code-Stil findest du im
[vollständigen Einrichtungsleitfaden](/app/setup#anderungen-commiten).

:::
