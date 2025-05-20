import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export const shared = defineConfig({
  title: "Neuland Next",
  cleanUrls: true,
  head: [
    ["meta", { charset: "UTF-8" }],
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
    ],
    ["meta", { name: "theme-color", content: "#0073ff" }],
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    ["link", { rel: "icon", href: "/favicon.png", type: "image/png" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "de_DE" }],
    ["meta", { property: "og:locale:alternate", content: "en_US" }],
    [
      "meta",
      {
        property: "og:title",
        content: "Neuland Next | Deine inoffizielle App für die THI",
      },
    ],
    [
      "meta",
      {
        property: "title",
        content: "Neuland Next | Deine inoffizielle App für die THI",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content: "Dein Studium an der THI in einer App.",
      },
    ],
    [
      "meta",
      {
        property: "description",
        content: "Dein Studium an der THI in einer App.",
      },
    ],
    [
      "meta",
      {
        property: "og:title",
        content: "Neuland Next | Deine inoffizielle App für die THI",
      },
    ],
    ["meta", { property: "og:image", content: "/og-image.png" }],
    ["meta", { property: "og:site_name", content: "Neuland Next" }],
    ["meta", { property: "og:url", content: "https://next.neuland.app" }],
    [
      "meta",
      {
        name: "keywords",
        content: "Neuland, THI, neuland.app, THI App, Neuland Next",
      },
    ],
    [
      "meta",
      {
        property: "twitter:title",
        content: "Neuland Next | Deine inoffizielle App für die THI",
      },
    ],
    [
      "meta",
      {
        property: "twitter:description",
        content: "Dein Studium an der THI in einer App.",
      },
    ],
    ["meta", { property: "twitter:image", content: "/og-image.png" }],
    ["link", { rel: "canonical", href: "https://next.neuland.app" }],
  ],
  rewrites: {
    "de/:rest*": ":rest*",
  },
  themeConfig: {
    logo: {
      dark: "/assets/logo-light.png",
      light: "/assets/logo-dark.png",
    },
    search: {
      provider: "local",
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/neuland-ingolstadt/neuland.app-native",
      },
      {
        icon: "instagram",
        link: "https://www.instagram.com/neuland_ingolstadt/",
      },
    ],
    editLink: {
      pattern:
        "https://github.com/neuland-ingolstadt/neuland.app-native/tree/main/docs/:path",
    },
  },
  lastUpdated: true,
});
