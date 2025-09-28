import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

/* ---------------- types ---------------- */

export type RecipeItem = {
  slug: string;
  title: string;
  tags?: string[];
  total?: number | null; // total minutes
  date?: Date | null; // ensure you pass Date (or adapt below)
  difficulty?: 'easy' | 'medium' | 'hard' | null;
  image?: string | null; // e.g. "/images/..." or absolute
  summary?: string | null;
};

type Props = { items: RecipeItem[] };

/* -------------- component --------------- */

export default function RecipesIndex({ items }: Props) {
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<'newest' | 'oldest' | 'shortest' | 'longest'>('newest');
  const [activeTags, setActiveTags] = React.useState<Set<string>>(new Set());
  const [difficulties, setDifficulties] = React.useState<Set<string>>(new Set());

  const allTags = React.useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [items]);

  function toggleTag(tag: string) {
    const s = new Set(activeTags);
    s.has(tag) ? s.delete(tag) : s.add(tag);
    setActiveTags(s);
  }

  function toggleDifficulty(value: string) {
    const s = new Set(difficulties);
    s.has(value) ? s.delete(value) : s.add(value);
    setDifficulties(s);
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = items.filter((i) => {
      const matchesQuery =
        !q ||
        i.title.toLowerCase().includes(q) ||
        (i.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesTags = activeTags.size === 0 || (i.tags || []).some((t) => activeTags.has(t));
      const matchesDiff =
        difficulties.size === 0 || (i.difficulty && difficulties.has(i.difficulty));
      return matchesQuery && matchesTags && matchesDiff;
    });

    out.sort((a, b) => {
      if (sort === 'newest') {
        const bDate = b.date instanceof Date ? b.date.getTime() : 0;
        const aDate = a.date instanceof Date ? a.date.getTime() : 0;
        return bDate - aDate;
      }
      if (sort === 'oldest') {
        const aDate = a.date instanceof Date ? a.date.getTime() : 0;
        const bDate = b.date instanceof Date ? b.date.getTime() : 0;
        return aDate - bDate;
      }
      if (sort === 'shortest') return (a.total ?? Infinity) - (b.total ?? Infinity);
      if (sort === 'longest') return (b.total ?? -1) - (a.total ?? -1);
      return 0;
    });

    return out;
  }, [items, query, activeTags, difficulties, sort]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="gap-0 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter recipes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="title or tag…"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort</label>
              <Select value={sort} onValueChange={(v: any) => setSort(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="shortest">Shortest time</SelectItem>
                  <SelectItem value="longest">Longest time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <ToggleGroup type="multiple" className="justify-start">
                {['easy', 'medium', 'hard'].map((d) => (
                  <ToggleGroupItem
                    key={d}
                    value={d}
                    aria-label={`Toggle ${d}`}
                    data-state={difficulties.has(d) ? 'on' : 'off'}
                    onClick={() => toggleDifficulty(d)}
                    className="capitalize"
                  >
                    {d}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`cursor-pointer select-none ${
                  activeTags.has(tag) ? '' : 'opacity-60 hover:opacity-100'
                }`}
                variant={activeTags.has(tag) ? 'default' : 'secondary'}
              >
                {tag}
              </Badge>
            ))}
            {allTags.length === 0 && <span className="text-sm text-slate-500">No tags yet</span>}
          </div>

          {(activeTags.size > 0 || difficulties.size > 0 || query) && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setSort('newest');
                  setActiveTags(new Set());
                  setDifficulties(new Set());
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RecipeCard key={r.slug} item={r} />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------- card --------------- */

function RecipeCard({ item }: { item: RecipeItem }) {
  const base = import.meta.env.BASE_URL; // "/nourriture-quotidienne/" on GH Pages
  const href = `${base}recipes/${item.slug}`;
  const imgSrc = item.image
    ? item.image.startsWith('/')
      ? base + item.image.slice(1)
      : item.image
    : null;

  return (
    <Card className="group hover:border-ring hover:ring-ring/50 overflow-hidden border border-slate-200 px-3 py-3 transition-[color,box-shadow] hover:ring-[3px] dark:border-slate-800">
      {imgSrc && (
        <a href={href} className="block">
          <div className="relative aspect-[4/3]">
            <img
              src={imgSrc}
              alt={item.title}
              className="absolute inset-0 block h-full w-full object-cover transition duration-300 group-hover:brightness-105"
              loading="lazy"
            />
          </div>
        </a>
      )}
      <CardContent className="space-y-3 p-4">
        <a href={href} className="block">
          <h3 className="line-clamp-2 leading-tight font-semibold">{item.title}</h3>
        </a>
        <div className="flex flex-wrap gap-2">
          {item.tags?.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
          {item.total != null && <Badge variant="outline">{item.total} min</Badge>}
          {item.difficulty && (
            <Badge variant="outline" className="capitalize">
              {item.difficulty}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------- empty --------------- */

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center text-slate-500">
        No recipes match your filters.
      </CardContent>
    </Card>
  );
}
