// src/components/RecipesGrid.tsx
import * as React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RecipeItem } from '@/components/RecipesIndex';
import { Typography } from '@/components/ui/typography';

type Translate = (k: string, params?: Record<string, unknown>) => string;
type TTag = (slug: string) => string;

const join = (a?: string, b?: string) => {
  const left = (a ?? '').replace(/\/+$/, '');
  const right = (b ?? '').replace(/^\/+/, '');
  return [left, right].filter(Boolean).join('/');
};
const withBase = (p: string) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const abs = p.startsWith('/') ? p : `/${p}`;
  return abs.startsWith(`${base}/`) ? abs : `${base}${abs}`;
};

export default function RecipesGrid({
  items,
  t,
  tTag,
  localePrefix,
}: {
  items: RecipeItem[];
  t: Translate;
  tTag: TTag;
  localePrefix: string;
}) {
  if (items.length === 0) {
    return (
      <Card className="border-border gap-0">
        <CardContent className="p-lg text-center opacity-70">{t('search.no_results')}</CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const href = item.slug ? join(localePrefix, `/${item.slug}`) : localePrefix || '/';
        const imgSrc = item.image
          ? item.image.startsWith('/')
            ? join(withBase(''), item.image)
            : item.image
          : null;

        return (
          <Card key={item.slug} className="px-md py-md gap-y-lg bg-card">
            {imgSrc && (
              <a href={href} className="block">
                <div className="relative m-0 aspect-[4/3] overflow-hidden p-0">
                  <img
                    src={imgSrc}
                    alt={item.title}
                    className="m-0 aspect-[4/3] w-full object-cover p-0 transition-opacity duration-200 group-hover:opacity-95 motion-reduce:transition-none"
                    loading="lazy"
                  />
                </div>
              </a>
            )}

            <CardContent className="flex w-full justify-center p-0">
              <Typography variant="cardTitle" className="m-0 p-0 text-center">
                {item.title}
              </Typography>
            </CardContent>
            <CardFooter>
              <div className="gap-sm flex flex-wrap">
                {item.tags?.slice(0, 3).map((slug) => (
                  <Badge key={String(slug)} variant="secondary">
                    {tTag(String(slug))}
                  </Badge>
                ))}
                {item.total != null && <Badge variant="outline">{item.total} min</Badge>}
                {item.difficulty && (
                  <Badge variant="outline" className="capitalize">
                    {t(`difficulty.${item.difficulty}`)}
                  </Badge>
                )}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
