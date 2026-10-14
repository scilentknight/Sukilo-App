import { createPersistentStore } from "@/lib/persistent-store";

function parseTheme(raw) {
  try {
    return JSON.parse(raw) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Admin panel colour scheme ("light" | "dark"), remembered per browser. */
export const adminThemeStore = createPersistentStore("sukilo-admin-theme", "light", parseTheme);
