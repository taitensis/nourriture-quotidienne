// tailwind.config.mjs
import typography from '@tailwindcss/typography';
// (optionnel) si tu utilises `line-clamp-3`, décommente :
// import lineClamp from '@tailwindcss/line-clamp';

export default {
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}',
    './src/content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        heading: ['var(--font-heading)'],
      },
      borderRadius: {
        xl: 'var(--radius)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
      },

      /* Typography suit tes variables de thème */
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--text)',
            '--tw-prose-headings': 'var(--text)',
            '--tw-prose-lead': 'var(--muted)',
            '--tw-prose-links': 'var(--accent)',
            '--tw-prose-bold': 'var(--text)',
            '--tw-prose-counters': 'var(--muted)',
            '--tw-prose-bullets': 'var(--muted)',
            '--tw-prose-hr': 'var(--border)',
            '--tw-prose-quotes': 'var(--text)',
            '--tw-prose-quote-borders': 'var(--border)',
            '--tw-prose-captions': 'var(--muted)',
            '--tw-prose-code': 'var(--text)',
            '--tw-prose-pre-code': 'var(--text)',
            '--tw-prose-pre-bg': 'var(--surface)',
            '--tw-prose-th-borders': 'var(--border)',
            '--tw-prose-td-borders': 'var(--border)',
          },
        },
        invert: {
          css: {
            '--tw-prose-body': 'var(--text)',
            '--tw-prose-headings': 'var(--text)',
            '--tw-prose-lead': 'var(--muted)',
            '--tw-prose-links': 'var(--accent)',
            '--tw-prose-bold': 'var(--text)',
            '--tw-prose-counters': 'var(--muted)',
            '--tw-prose-bullets': 'var(--muted)',
            '--tw-prose-hr': 'var(--border)',
            '--tw-prose-quotes': 'var(--text)',
            '--tw-prose-quote-borders': 'var(--border)',
            '--tw-prose-captions': 'var(--muted)',
            '--tw-prose-code': 'var(--text)',
            '--tw-prose-pre-code': 'var(--text)',
            '--tw-prose-pre-bg': 'var(--surface)',
            '--tw-prose-th-borders': 'var(--border)',
            '--tw-prose-td-borders': 'var(--border)',
          },
        },
      },
    },
  },
  plugins: [
    typography(),
    lineClamp(),
  ],
  safelist: [
    // classes you add/remove in JS
    "translate-x-full",
    "translate-x-0",
    "opacity-0",
    "opacity-100",
    "pointer-events-none",
    "pointer-events-auto",
    // add "hidden" too if you toggle it anywhere via JS
    "hidden",
  ],
};
