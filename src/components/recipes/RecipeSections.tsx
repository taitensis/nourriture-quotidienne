import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

const paneClass = 'outline-none ml-4 max-w-3xl text-[clamp(1rem,0.4vw+0.9rem,1.125rem)]';

type IngredientGroup = { title?: string; ingredients: string[] };
type Nutrition = {
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
};

type Props = {
  recipeId?: string;
  ingredients?: IngredientGroup[];
  steps?: string[];
  notes?: string[];
  nutrition?: Nutrition | null; // ← new
};

type TabId = 'ingredients' | 'steps' | 'notes' | 'nutritional-values';

export default function RecipeSections({
  recipeId = '',
  ingredients = [],
  steps = [],
  notes = [],
  nutrition = null,
}: Props) {
  const hasNotes = notes.length > 0;
  const hasNutrition = hasNutritionValues(nutrition);

  // ---------- checkbox state (persist per recipe) ----------
  const storageKey = recipeId ? `ing:${recipeId}` : null;
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  function setPersist(next: Record<string, boolean>) {
    setChecked(next);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    }
  }
  function toggle(id: string, v: boolean | 'indeterminate') {
    setPersist({ ...checked, [id]: Boolean(v) });
  }

  const stepsStorageKey = recipeId ? `steps:${recipeId}` : null;
  const [stepsChecked, setStepsChecked] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    if (!stepsStorageKey) return;
    try {
      const raw = localStorage.getItem(stepsStorageKey);
      if (raw) setStepsChecked(JSON.parse(raw));
    } catch {}
  }, [stepsStorageKey]);

  function setStepsPersist(next: Record<number, boolean>) {
    setStepsChecked(next);
    if (stepsStorageKey) {
      try {
        localStorage.setItem(stepsStorageKey, JSON.stringify(next));
      } catch {}
    }
  }
  function toggleStep(i: number, v: boolean | 'indeterminate') {
    setStepsPersist({ ...stepsChecked, [i]: Boolean(v) });
  }
  function resetSteps() {
    setStepsPersist({});
  }
  // ---------------------------------------------------------

  // Build tabs dynamically (order matters)
  const tabs: { id: TabId; label: string }[] = [
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'steps', label: 'Steps' },
    ...(hasNotes ? [{ id: 'notes' as TabId, label: 'Notes' }] : []),
    ...(hasNutrition ? [{ id: 'nutritional-values' as TabId, label: 'Nutritional Values' }] : []),
  ];

  // Default tab from hash (if valid), else first
  const initial: TabId = (() => {
    const h = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    const allowed = new Set(tabs.map((t) => t.id));
    if (h && allowed.has(h as TabId)) return h as TabId;
    return tabs[0]?.id ?? 'ingredients';
  })();

  const [value, setValue] = React.useState<TabId>(initial);

  // React to manual hash changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      const h = window.location.hash.replace('#', '');
      const allowed = new Set(tabs.map((t) => t.id));
      if (h && allowed.has(h as TabId)) setValue(h as TabId);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [tabs]);

  // Keep the URL hash in sync with the active tab
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash !== `#${value}`) {
      history.replaceState(null, '', `#${value}`);
    }
  }, [value]);

  // Dynamic grid cols (2..4)
  const gridCols =
    tabs.length === 2 ? 'grid-cols-2' : tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <>
      {/* Screen: tabs UI */}
      <div className="print:hidden">
        <Tabs value={value} onValueChange={(v) => setValue(v as TabId)} className="space-y-4">
          <TabsList
            className={`grid h-auto w-full ${gridCols} items-start gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800`}
          >
            {tabs.map((t) => (
              <TabsTrigger
                key={t.id}
                id={`tab-${t.id}`}
                value={t.id}
                className="w-full rounded-lg px-3 py-2 text-center text-[clamp(0.75rem,0.25vw+0.7rem,0.875rem)] leading-snug font-semibold break-words whitespace-normal data-[state=active]:bg-white data-[state=active]:shadow-sm sm:text-[clamp(0.875rem,0.3vw+0.8rem,1rem)] dark:data-[state=active]:bg-slate-950"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Ingredients (checkbox list) */}
          <TabsContent value="ingredients" aria-labelledby="tab-ingredients" className={paneClass}>
            <h2 className="sr-only print:not-sr-only print:mb-3">Ingredients</h2>

            <div className="space-y-6">
              {ingredients.map((g, gi) => (
                <div key={gi}>
                  {g.title && <h3 className="mb-2 font-medium">{g.title}</h3>}

                  {/* Checkbox list instead of bullets */}
                  <ul className="space-y-3">
                    {g.ingredients.map((text, idx) => {
                      const id = `${recipeId || 'recipe'}:${gi}:${idx}`;
                      const isChecked = !!checked[id];
                      return (
                        <li key={id} className="flex items-center gap-3">
                          <Checkbox
                            id={id}
                            checked={isChecked}
                            onCheckedChange={(v) => toggle(id, v)}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor={id}
                            className={`select-none ${
                              isChecked ? 'text-slate-400 line-through' : ''
                            }`}
                          >
                            {text}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {ingredients.length === 0 && <Empty>Missing ingredients</Empty>}
            </div>
          </TabsContent>

          {/* Steps */}
          <TabsContent value="steps" aria-labelledby="tab-steps" className={paneClass}>
            <h2 className="sr-only print:not-sr-only print:mb-3">Steps</h2>
            {steps.length ? (
              <ol className="space-y-3">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold dark:bg-slate-800">
                      {i + 1}
                    </div>

                    <p className="min-w-0 flex-1 leading-relaxed break-words">{s}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty>Missing steps</Empty>
            )}
          </TabsContent>

          {/* Notes */}
          {hasNotes && (
            <TabsContent value="notes" aria-labelledby="tab-notes" className={paneClass}>
              <h2 className="sr-only marker:text-slate-400 print:not-sr-only print:mb-3">Notes</h2>
              <ul className="list-disc space-y-3 pl-6">
                {notes.map((n, i) => (
                  <li
                    key={i}
                    className="leading-relaxed break-words text-slate-600 dark:text-slate-300"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </TabsContent>
          )}

          {/* Nutrition */}
          {hasNutrition && (
            <TabsContent
              value="nutritional-values"
              aria-labelledby="tab-nutritional-values"
              className={paneClass}
            >
              <h2 className="sr-only print:not-sr-only print:mb-3">Nutritional Values</h2>
              <NutritionTable nutrition={nutrition!} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Print: stacked fallback (always visible on paper) */}
      <div className="hidden space-y-8 print:block">
        <div>
          <SectionHeading>Ingredients</SectionHeading>
          {ingredients.length ? (
            ingredients.map((g, i) => (
              <div key={i} className="mb-4">
                {g.title && <h3 className="mb-2 font-medium">{g.title}</h3>}
                <ul className="list-disc space-y-1 pl-6">
                  {g.ingredients.map((it, idx) => (
                    <li key={idx} className="items-center">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <Empty>Missing ingredients</Empty>
          )}
        </div>

        <div>
          <SectionHeading>Steps</SectionHeading>
          {steps.length ? (
            <ol className="list-decimal space-y-2 pl-6">
              {steps.map((s, i) => (
                <li key={i} className="items-center">
                  {s}
                </li>
              ))}
            </ol>
          ) : (
            <Empty>Missing steps</Empty>
          )}
        </div>

        {hasNotes && (
          <div>
            <SectionHeading>Notes</SectionHeading>
            <ul className="list-disc space-y-1 pl-6">
              {notes.map((n, i) => (
                <li key={i} className="items-center">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasNutrition && (
          <div>
            <SectionHeading>Nutritional Values</SectionHeading>
            <NutritionTable nutrition={nutrition!} />
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- helpers & subcomponents ---------- */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-[clamp(1.5rem,1.8vw+.8rem,2rem)] font-semibold">{children}</h2>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-500">{children}</p>;
}

function hasNutritionValues(n?: Nutrition | null) {
  if (!n) return false;
  return Object.values(n).some((v) => typeof v === 'number' && !Number.isNaN(v));
}

function NutritionTable({ nutrition }: { nutrition: Nutrition }) {
  const rows: Array<{ label: string; value?: number; suffix?: string }> = [
    { label: 'Calories', value: nutrition.calories },
    { label: 'Protein', value: nutrition.protein_g, suffix: ' g' },
    { label: 'Carbs', value: nutrition.carbs_g, suffix: ' g' },
    { label: 'Fat', value: nutrition.fat_g, suffix: ' g' },
    { label: 'Fiber', value: nutrition.fiber_g, suffix: ' g' },
    { label: 'Sugar', value: nutrition.sugar_g, suffix: ' g' },
    { label: 'Sodium', value: nutrition.sodium_mg, suffix: ' mg' },
  ].filter((r) => typeof r.value === 'number' && !Number.isNaN(r.value));

  if (rows.length === 0) return <Empty>No nutrition provided</Empty>;

  return (
    <Table className="mx-auto max-w-3xl text-[clamp(0.875rem,0.3vw+0.8rem,1rem)]">
      <TableCaption>Per serving</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold">Nutrient</TableHead>
          <TableHead className="text-right font-bold">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.label}>
            <TableCell>{r.label}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {r.value}
              {r.suffix ?? ''}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
