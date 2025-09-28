import type { Locale } from '@/i18n/ui';

// Import the available locales from your ui file
export const LOCALES: readonly Locale[] = ['en', 'fr', 'es', 'nl'] as const;

/**
 * Get the appropriate locale from various sources
 */
export function getLocale(astroLocale?: string): Locale {
  return (astroLocale as Locale) || 'en';
}

/**
 * Format dates according to locale
 */
export function formatDate(
  date: Date | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return dateObj.toLocaleDateString(locale, defaultOptions);
}

/**
 * Format numbers according to locale
 */
export function formatNumber(
  number: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return number.toLocaleString(locale, options);
}

/**
 * Get the reading direction for a locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Generate hreflang links for all locales
 */
export function generateHreflangLinks(
  locales: readonly Locale[],
  getUrl: (locale: Locale) => string
): Array<{ locale: Locale; url: string }> {
  return locales.map((locale) => ({
    locale,
    url: getUrl(locale),
  }));
}

/**
 * Pluralization helper
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
  locale: Locale = 'en'
): string {
  const pluralForm = plural || singular + 's';

  // Use Intl.PluralRules for proper pluralization
  const pr = new Intl.PluralRules(locale);
  const rule = pr.select(count);

  switch (rule) {
    case 'one':
      return `${count} ${singular}`;
    default:
      return `${count} ${pluralForm}`;
  }
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date | string, locale: Locale = 'en'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);

  const units: Array<[string, number]> = [
    ['year', 365 * 24 * 60 * 60],
    ['month', 30 * 24 * 60 * 60],
    ['day', 24 * 60 * 60],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, seconds] of units) {
    const interval = Math.floor(Math.abs(diffInSeconds) / seconds);
    if (interval >= 1) {
      return rtf.format(
        diffInSeconds < 0 ? -interval : interval,
        unit as Intl.RelativeTimeFormatUnit
      );
    }
  }

  return rtf.format(0, 'second');
}

/**
 * Currency formatter
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: Locale = 'en'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
