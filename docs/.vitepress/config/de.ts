import { createRequire } from "module";
import { defineConfig, type DefaultTheme } from "vitepress";

export const de = defineConfig({
  lang: "de-DE",
  description: "Dein Studium an der THI in einer App.",

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "App", link: "/app/main" },
      { text: "Über uns", link: "/about/club" },
    ],
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "Suchen",
            buttonAriaLabel: "Suchen",
          },
          modal: {
            displayDetails: "Details anzeigen",
            resetButtonTitle: "Zurücksetzen",
            backButtonTitle: "Zurück",
            noResultsText: "Keine Ergebnisse gefunden",
            footer: {
              selectText: "Auswählen",
              navigateText: "Navigieren",
              closeText: "Schließen",
            },
          },
        },
      },
    },

    footer: {
      message:
        '<a href="/legal/imprint">Impressum</a> & <a href="/legal/privacy">Datenschutz</a>',
      copyright: "Copyright © 2024 Neuland Ingolstadt e.V.",
    },
    sidebar: {
      "/app/": { base: "/app/", items: sidebarApp() },
      "/about/": { base: "/about/", items: sidebarAbout() },
    },
    docFooter: {
      prev: "Vorherige Seite",
      next: "Nächste Seite",
    },
    outline: {
      label: "Auf dieser Seite",
    },

    lastUpdated: {
      text: "Aktualisiert am",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },

    langMenuLabel: "Sprache wechseln",
    returnToTopLabel: "Nach oben zurückkehren",
    sidebarMenuLabel: "Seitenmenü",
    darkModeSwitchLabel: "Erscheinungsbild",
    lightModeSwitchTitle: "Zu hellem Modus wechseln",
    darkModeSwitchTitle: "Zu dunklem Modus wechseln",
  },
});

function sidebarApp(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Die App",
      collapsed: false,
      items: [
        { text: "Neuland Next", link: "main" },
        { text: "Funktionen", link: "features" },
        { text: "FAQ", link: "faq" },
        { text: "Installieren", link: "download" },
        { text: "Beta", link: "beta" },
      ],
    },
    {
      text: "Support",
      collapsed: false,
      items: [
        { text: "Fehlerbehebung", link: "troubleshoot" },
        { text: "Feedback", link: "feedback" },
      ],
    },
    {
      text: "Mitwirken",
      collapsed: false,
      items: [
        { text: "Wege zur Mitarbeit", link: "contribute" },
        { text: "Entwicklungsumgebung einrichten", link: "setup" },
      ],
    },
  ];
}
function sidebarAbout(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "About Neuland",
      items: [
        { text: "Neuland Ingolstadt", link: "club" },
        { text: "Entwickler", link: "contributors" },
      ],
    },
  ];
}
