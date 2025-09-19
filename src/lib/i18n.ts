export const SUPPORTED_LANGS = ["en", "fr"] as const;
export type Lang = typeof SUPPORTED_LANGS[number];
