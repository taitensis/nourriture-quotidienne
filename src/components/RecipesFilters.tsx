// src/components/RecipesFilters.tsx
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

type Translate = (k: string, params?: Record<string, unknown>) => string;
type SortKey = 'newest' | 'oldest' | 'fastest' | 'longest';

type Props = {
  t: Translate;
  allTags: string[];
  tTag: (slug: string) => string;

  query: string;
  setQuery: (v: string) => void;

  sort: SortKey;
  setSort: (v: SortKey) => void;

  activeTags: Set<string>;
  toggleTag: (tag: string) => void;

  difficulties: Set<string>;
  toggleDifficulty: (d: string) => void;

  reset: () => void;
};

export default function RecipesFilters({
  t,
  allTags,
  tTag,
  query,
  setQuery,
  sort,
  setSort,
  activeTags,
  toggleTag,
  difficulties,
  toggleDifficulty,
  reset,
}: Props) {
  return (
    <Card className="border-border gap-0">
      <CardHeader className="pb-md">
        <CardTitle className="text-base">{t('search.filter_recipes')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-md">
        <div className="gap-md grid grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)_auto]">
          {/* Search */}
          <div className="space-y-xs min-w-0">
            <label className="text-sm font-medium">{t('search.search')}</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.title_or_tag')}
              aria-label={t('search.title_or_tag')}
              autoComplete="off"
            />
          </div>

          {/* Sort */}
          <div className="space-y-xs min-w-0">
            <label className="text-sm font-medium">{t('search.sort')}</label>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('search.sort_newest')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('search.sort_newest')}</SelectItem>
                <SelectItem value="oldest">{t('search.sort_oldest')}</SelectItem>
                <SelectItem value="fastest">{t('search.fastest')}</SelectItem>
                <SelectItem value="longest">{t('search.longest')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}

          <div className="space-y-xs min-w-0">
            <label className="text-sm font-medium">{t('search.difficulty')}</label>

            <ToggleGroup type="multiple" className="gap-sm justify-start">
              {(['easy', 'medium', 'hard'] as const).map((d) => {
                const active = difficulties.has(d);
                return (
                  <ToggleGroupItem
                    key={d}
                    value={d}
                    data-state={active ? 'on' : 'off'}
                    aria-pressed={active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleDifficulty(d);
                    }}
                    type="button"
                    className={cn(
                      // Reset ToggleGroup styles and apply badge styles
                      'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
                      'data-[state=off]:bg-secondary data-[state=off]:text-secondary-foreground',
                      'px-md h-8 cursor-pointer rounded-md text-sm capitalize select-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      active ? '' : 'opacity-60 hover:opacity-100'
                    )}
                  >
                    {t(`difficulty.${d}`)}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        {allTags.length > 0 ? (
          <div className="gap-sm flex flex-wrap">
            {allTags.map((tag) => {
              const active = activeTags.has(tag);
              return (
                <Badge
                  key={tag}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTag(tag);
                  }}
                  className={`cursor-pointer select-none ${active ? '' : 'opacity-60 hover:opacity-100'}`}
                  variant={active ? 'default' : 'secondary'}
                >
                  {tTag(tag)}
                </Badge>
              );
            })}
          </div>
        ) : (
          <span className="text-sm opacity-70">{t('search.no_tags_yet')}</span>
        )}

        {(activeTags.size > 0 || difficulties.size > 0 || query) && (
          <div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <span className="text-sm">{t('search.reset_filters')}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
