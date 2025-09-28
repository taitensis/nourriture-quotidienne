// src/components/RecipesIndex.tsx
import * as React from 'react';
import RecipesFilters from '@/components/RecipesFilters';
import RecipesGrid from '@/components/RecipesGrid';
import { makeT, DEFAULT_LOCALE, type Locale } from '@/i18n/ui';

export type RecipeItem = {
  slug: string;
  title: string;
  tags?: string[];
  total?: number | null;
  date?: Date | string | null;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  image?: string | null;
  summary?: string | null;
};

type Props = {
  items: RecipeItem[];
  locale?: Locale;
  localePrefix?: string; // '' or '/fr'
};

type Translate = (k: string, params?: Record<string, unknown>) => string;

export default function RecipesIndex({ items, locale = DEFAULT_LOCALE, localePrefix = '' }: Props) {
  // local translator for this locale
  const t = React.useMemo<Translate>(() => makeT(locale), [locale]);

  // slug -> localized tag label with fallback to slug
  const tTag = React.useCallback(
    (slug: string) => {
      const key = `tags.${slug}`;
      const out = t(key);
      return out === key ? slug : out;
    },
    [t]
  );

  // state
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<'newest' | 'oldest' | 'fastest' | 'longest'>('newest');
  const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set());
  const [difficulties, setDifficulties] = React.useState<Set<string>>(new Set());

  // all tags from items (sorted by localized label)
  const allTags = React.useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.tags?.forEach((tag) => s.add(String(tag))));
    return Array.from(s).sort((a, b) => tTag(a).localeCompare(tTag(b)));
  }, [items, tTag]);

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const s = new Set(prev);
      s.has(tag) ? s.delete(tag) : s.add(tag);
      return s;
    });
  }

  function toggleDifficulty(value: string) {
    setDifficulties((prev) => {
      const s = new Set(prev);
      s.has(value) ? s.delete(value) : s.add(value);
      return s;
    });
  }

  // derived list
  const filtered = React.useMemo(() => {
    const toMs = (d: unknown) =>
      typeof d === 'string' ? Date.parse(d) : d instanceof Date ? d.getTime() : 0;

    const fold = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');

    const q = fold(query.trim());

    let out = items.filter((i) => {
      const title = fold(i.title);
      const tagLabels = (i.tags || []).map((slug) => fold(tTag(String(slug))));
      const matchesQuery = !q || title.includes(q) || tagLabels.some((t) => t.includes(q));
      const matchesTags =
        activeTags.size === 0 || (i.tags || []).some((slug) => activeTags.has(String(slug)));
      const matchesDiff =
        difficulties.size === 0 || (i.difficulty && difficulties.has(i.difficulty));
      return matchesQuery && matchesTags && matchesDiff;
    });

    out.sort((a, b) => {
      if (sort === 'newest') return toMs(b.date) - toMs(a.date);
      if (sort === 'oldest') return toMs(a.date) - toMs(b.date);
      if (sort === 'fastest') return (a.total ?? Infinity) - (b.total ?? Infinity);
      if (sort === 'longest') return (b.total ?? -1) - (a.total ?? -1);
      return 0;
    });

    return out;
  }, [items, query, activeTags, difficulties, sort, tTag]);

  const reset = () => {
    setQuery('');
    setSort('newest');
    setActiveTags(new Set());
    setDifficulties(new Set());
  };

  return (
    <div className="space-y-lg">
      <RecipesFilters
        t={t}
        allTags={allTags}
        tTag={tTag}
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        activeTags={activeTags}
        toggleTag={toggleTag}
        difficulties={difficulties}
        toggleDifficulty={toggleDifficulty}
        reset={reset}
      />

      <RecipesGrid items={filtered} t={t} tTag={tTag} localePrefix={localePrefix} />
    </div>
  );
}
