// src/i18n/ui.ts
import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import nl from './locales/nl.json';

/* ---------- types & default ---------- */
export type Locale = 'en' | 'fr' | 'es' | 'nl';
export const DEFAULT_LOCALE: Locale = 'en';

type TranslationParams = Record<string, unknown>;

/* ---------- dictionaries ---------- */
export const translations = {
  en,
  fr,
  es,
  nl,
} as const;

/* ---------- helpers ---------- */
function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

/** ICU-ish plural + # number + named placeholders + simple {a|b} */
function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;

  // ICU plural with # number: {count, plural, one {# x} other {# y}}
  template = template.replace(
    /\{(\w+)\s*,\s*plural\s*,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\s*\}/g,
    (_, key, one, other) => {
      const n = Number(params[key]);
      const chosen = n === 1 ? one : other;
      return chosen.replace(/#/g, isNaN(n) ? '#' : String(n));
    }
  );

  // simple {a|b} based on params.count
  template = template.replace(/\{([^{}|]+)\|([^{}|]+)\}/g, (_, singular, plural) => {
    const c = Number(params.count);
    return Number.isFinite(c) && c === 1 ? singular : plural;
  });

  // named placeholders: {name}
  template = template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] != null ? String(params[key]) : ''
  );

  return template;
}

/* ---------- build lookups ---------- */
function buildLocaleMap(locale: Locale): Record<string, string> {
  const base = flatten(translations.en);
  const loc = flatten(translations[locale] as any);
  return { ...base, ...loc };
}

/* ---------- global context ---------- */
let currentLocale: Locale = DEFAULT_LOCALE;
let currentMap: Record<string, string> = buildLocaleMap(DEFAULT_LOCALE);
let fallbackMap: Record<string, string> = buildLocaleMap('en');

/* ---------- global t function ---------- */
export function setLocale(locale: Locale) {
  currentLocale = locale;
  currentMap = buildLocaleMap(locale);
  fallbackMap = buildLocaleMap('en');
}

export function t(key: string, params?: TranslationParams): string {
  const resolvedKey = key;
  const raw =
    currentMap[resolvedKey] ??
    currentMap[key] ??
    fallbackMap[resolvedKey] ??
    fallbackMap[key] ??
    key;
  return interpolate(raw, params);
}

/* ---------- legacy API (keep for backward compatibility) ---------- */
export function makeT(locale: Locale = DEFAULT_LOCALE) {
  const map = buildLocaleMap(locale);
  const fallback = buildLocaleMap('en');

  return (key: string, params?: TranslationParams) => {
    const resolvedKey = key;
    const raw = map[resolvedKey] ?? map[key] ?? fallback[resolvedKey] ?? fallback[key] ?? key;
    return interpolate(raw, params);
  };
}

/* ---------- React-style hook (optional) ---------- */
export function useTranslation(locale: Locale) {
  return { t: (key: string, params?: TranslationParams) => makeT(locale)(key, params), locale };
}

/* ---------- Locale labels & flags ---------- */
export function getLocaleLabel(locale: Locale): string {
  const labels: Record<Locale, string> = {
    en: 'English',
    fr: 'Français',
    es: 'Español',
    nl: 'Nederlands',
  };
  return labels[locale] ?? locale;
}

export const LOCALES: readonly Locale[] = ['en', 'fr', 'es', 'nl'] as const;

export function getLocaleFlag(locale: Locale): string {
  const flags: Record<Locale, string> = {
    en: '🇺🇸',
    fr: '🇫🇷',
    es: '🇪🇸',
    nl: '🇳🇱',
  };
  return flags[locale] ?? '🏳️';
}
