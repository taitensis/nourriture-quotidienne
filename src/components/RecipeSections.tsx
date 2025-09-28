import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Typography, List } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const paneClass = 'outline-none lg:ml-lg px-4 sm:px-6 lg:px-0';

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
  nutrition?: Nutrition | null;
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

  const tabs: { id: TabId; label: string }[] = [
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'steps', label: 'Steps' },
    ...(hasNotes ? [{ id: 'notes' as TabId, label: 'Notes' }] : []),
    ...(hasNutrition ? [{ id: 'nutritional-values' as TabId, label: 'Nutritional Values' }] : []),
  ];

  const initial: TabId = (() => {
    const h = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    const allowed = new Set(tabs.map((t) => t.id));
    if (h && allowed.has(h as TabId)) return h as TabId;
    return tabs[0]?.id ?? 'ingredients';
  })();

  const [value, setValue] = React.useState<TabId>(initial);
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
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash !== `#${value}`) {
      history.replaceState(null, '', `#${value}`);
    }
  }, [value]);

  const gridCols =
    tabs.length === 2 ? 'grid-cols-2' : tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <>
      <div className="print:hidden">
        <Tabs value={value} onValueChange={(v) => setValue(v as TabId)} className="space-y-4">
          <TabsList
            className={`grid w-full ${gridCols} bg-primary/10 gap-sm h-auto rounded-lg p-1`}
          >
            {tabs.map((t) => (
              <TabsTrigger
                key={t.id}
                id={`tab-${t.id}`}
                value={t.id}
                className="data-[state=active]:bg-background data-[state=active]:text-foreground w-full min-w-0 justify-center rounded-md text-center break-words whitespace-normal"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="ingredients" aria-labelledby="tab-ingredients" className={paneClass}>
            <h2 className="print:mb-sm sr-only print:not-sr-only">Ingredients</h2>
            <div className="space-y-md">
              <List
                items={ingredients}
                className="my-0 list-none space-y-6 [&>li]:mt-0"
                renderItem={(g, gi) => (
                  <>
                    {g.title && <h3 className="mb-xs font-medium">{g.title}</h3>}
                    <List
                      items={g.ingredients}
                      className="space-y-md my-0 ml-0 list-none [&>li]:mt-0"
                      renderItem={(text, idx) => {
                        const id = `${recipeId || 'recipe'}:${gi}:${idx}`;
                        const isChecked = !!checked[id];
                        return (
                          <div className="gap-md flex items-center">
                            <Checkbox
                              id={id}
                              checked={isChecked}
                              onCheckedChange={(v) => toggle(id, v)}
                              className=""
                            />
                            <label
                              htmlFor={id}
                              className={cn(
                                'select-none',
                                isChecked && 'text-primary/75 line-through'
                              )}
                            >
                              {text}
                            </label>
                          </div>
                        );
                      }}
                    />
                  </>
                )}
              />
              {ingredients.length === 0 && <Empty>Missing ingredients</Empty>}
            </div>
          </TabsContent>

          <TabsContent value="steps" aria-labelledby="tab-steps" className={paneClass}>
            <h2 className="print:mb-sm sr-only print:not-sr-only">Steps</h2>
            {steps.length ? (
              <List
                as="ol"
                items={steps}
                className="space-y-md my-0 list-none [&>li]:mt-0"
                renderItem={(s, i) => (
                  <div className="gap-md flex items-center">
                    <div className="text-primary bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold">
                      {i + 1}
                    </div>
                    <p className="min-w-0 flex-1 leading-relaxed break-words">{s}</p>
                  </div>
                )}
              />
            ) : (
              <Empty>Missing steps</Empty>
            )}
          </TabsContent>

          {hasNotes && (
            <TabsContent value="notes" aria-labelledby="tab-notes" className={paneClass}>
              <h2 className="marker:text-foreground print:mb-md sr-only print:not-sr-only">
                Notes
              </h2>
              <List
                items={notes}
                className="space-y-md pl-xl marker:text-primary/90 my-0 ml-0 list-disc [&>li]:mt-0"
                renderItem={(n) => <span className="leading-relaxed break-words">{n}</span>}
              />
            </TabsContent>
          )}

          {hasNutrition && (
            <TabsContent
              value="nutritional-values"
              aria-labelledby="tab-nutritional-values"
              className="mx-auto"
            >
              <h2 className="print:mb-md sr-only print:not-sr-only">Nutritional Values</h2>
              <NutritionTable nutrition={nutrition!} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <div className="hidden space-y-8 print:block">
        <div>
          <SectionHeading>Ingredients</SectionHeading>
          {ingredients.length ? (
            ingredients.map((g, i) => (
              <div key={i} className="mb-md">
                {g.title && <h3 className="mb-2 font-medium">{g.title}</h3>}
                <ul className="space-y-sm pl-lg list-disc">
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
            <ol className="space-y-md pl-lg list-decimal">
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
            <ul className="space-y-md pl-lg list-disc">
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
  const { calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg } = nutrition ?? {};
  const energyKJ =
    typeof calories === 'number' && !Number.isNaN(calories)
      ? Math.round(calories * 4.184)
      : undefined;
  const salt_g =
    typeof sodium_mg === 'number' && !Number.isNaN(sodium_mg)
      ? +((sodium_mg * 2.5) / 1000).toFixed(2)
      : undefined;

  type Row = { label: string; value?: string; isGroup?: boolean; isChild?: boolean };
  const rows: Row[] = [
    energyKJ != null && calories != null
      ? { label: 'Energy', value: `${energyKJ} kJ / ${calories} kcal`, isGroup: true }
      : undefined,
    fat_g != null ? { label: 'Fat', value: `${fat_g} g`, isGroup: true } : undefined,
    carbs_g != null ? { label: 'Carbohydrate', value: `${carbs_g} g`, isGroup: true } : undefined,
    sugar_g != null
      ? { label: '— of which sugars', value: `${sugar_g} g`, isChild: true }
      : undefined,
    fiber_g != null ? { label: 'Fibre', value: `${fiber_g} g` } : undefined,
    protein_g != null ? { label: 'Protein', value: `${protein_g} g` } : undefined,
    salt_g != null ? { label: 'Salt', value: `${salt_g} g` } : undefined,
  ].filter(Boolean) as Row[];

  if (rows.length === 0) return <Empty>No nutrition provided</Empty>;

  return (
    <figure>
      <figcaption className="sr-only">Nutrition declaration (per serving)</figcaption>
      <table className="border-border border-primary/15 table-auto border-2">
        <thead>
          <tr>
            <th
              className="border-border px-md py-sm border-primary/15 w-2/3 border-b-2 text-left font-bold"
              scope="col"
            >
              Nutrition
              <br />
              <span className="text-muted-foreground font-normal">(per serving)</span>
            </th>
            <th
              className="border-border px-md py-sm border-primary/15 w-1/3 border-b-2 text-right font-bold"
              scope="col"
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const topRule =
              i === 0 || r.isGroup ? 'border-t-2 border-primary/15 border-border' : '';
            return (
              <tr key={r.label} className={topRule}>
                <th
                  scope="row"
                  className={cn(
                    'px-md py-sm text-left font-medium',
                    r.isGroup && 'font-bold',
                    r.isChild && 'pl-xl text-muted-foreground'
                  )}
                >
                  {r.label}
                </th>
                <td className="px-md py-sm text-right font-medium whitespace-normal tabular-nums sm:whitespace-nowrap">
                  {r.value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </figure>
  );
}
