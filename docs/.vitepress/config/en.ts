import { createRequire } from "module";
import { defineConfig, type DefaultTheme } from "vitepress";

const require = createRequire(import.meta.url);

export const en = defineConfig({
  lang: "en-US",
  description: "Your studies at THI in one app.",

  themeConfig: {
    nav: [
      { text: "Home", link: "/en/" },

      { text: "App", link: "/en/app/main" },
      { text: "About Us", link: "/en/about/club" },
    ],

    footer: {
      message:
        '<a href="/legal/imprint">Imprint</a> & <a href="/legal/privacy">Privacy</a>',
      copyright: "Copyright © 2024 Neuland Ingolstadt e.V.",
    },
    sidebar: {
      "/en/app/": { base: "/en/app/", items: sidebarApp() },
      "/en/about/": { base: "/en/about/", items: sidebarAbout() },
    },
  },
});

function sidebarApp(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "The App",
      collapsed: false,
      items: [
        { text: "Neuland Next", link: "main" },
        { text: "Features", link: "features" },
        { text: "FAQ", link: "faq" },
        { text: "Install", link: "download" },
        { text: "Beta", link: "beta" },
      ],
    },
    {
      text: "Support",
      collapsed: false,
      items: [
        { text: "Troubleshooting", link: "troubleshoot" },
        { text: "Feedback", link: "feedback" },
      ],
    },
    {
      text: "Contributing",
      collapsed: false,
      items: [
        { text: "Ways to Contribute", link: "contribute" },
        { text: "Setup Development Environment", link: "setup" },
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
        { text: "Contributors", link: "contributors" },
      ],
    },
  ];
}
