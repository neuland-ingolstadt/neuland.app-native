import { defineConfig } from "vitepress";
import { shared } from "./shared";
import { en } from "./en";
import { de } from "./de";

export default defineConfig({
  ...shared,
  locales: {
    root: { label: "Deutsch", ...de },
    en: { label: "English", ...en },
  },
});
