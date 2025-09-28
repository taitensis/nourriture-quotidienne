import React from 'react';
import { cn } from '@/lib/utils';
import { CardTitle } from './card';

// Typography Component accepting a "variant" prop for different text elements
interface TypographyProps {
  variant:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'cardTitle'
    | 'p'
    | 'blockquote'
    | 'lead'
    | 'large'
    | 'small'
    | 'muted'
    | 'inlineCode';
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType; // Allow custom element override
}

export const Typography: React.FC<TypographyProps> = ({
  variant,
  className = '',
  children,
  as,
}) => {
  const classes = {
    h1: 'scroll-m-20 text-balance text-4xl font-extrabold tracking-tight',
    h2: 'scroll-m-20 text-balance text-3xl font-semibold tracking-tight first:mt-0',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    cardTitle: 'scroll-m-20 text-balance text-md font-semibold tracking-tight',
    p: 'leading-7 [&:not(:first-child)]:mt-6',
    blockquote: 'mt-md border-l-xs pl-md italic',
    lead: 'text-muted-foreground text-xl',
    large: 'text-lg font-semibold',
    small: 'text-sm font-medium leading-none',
    muted: 'text-muted-foreground text-sm',
    inlineCode: 'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
  };

  // Default element mapping
  const elements = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    cardTitle: 'cardTitle',
    p: 'p',
    blockquote: 'blockquote',
    lead: 'p',
    large: 'div',
    small: 'small',
    muted: 'p',
    inlineCode: 'code',
  };

  const Component = as || elements[variant] || 'p';

  return <Component className={cn(classes[variant], className)}>{children}</Component>;
};

// Generic List component
interface ListProps<T> {
  as?: 'ul' | 'ol';
  items: T[];
  renderItem?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function List<T>({ as: Component = 'ul', items, renderItem, className = '' }: ListProps<T>) {
  return (
    <Component className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)}>
      {items.map((item, index) => (
        <li key={index}>{renderItem ? renderItem(item, index) : String(item)}</li>
      ))}
    </Component>
  );
}

// RENAMED to avoid conflict with shadcn Table
interface DataColumn<T> {
  key: keyof T;
  label: string;
  align?: 'left' | 'center' | 'right';
  renderCell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  data: T[];
  className?: string;
}

export function DataTable<T>({ columns, data, className = '' }: DataTableProps<T>) {
  return (
    <div className={cn('my-6 w-full overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="even:bg-muted border-t">
            {columns.map(({ label, align }, index) => (
              <th
                key={index}
                align={align}
                className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="even:bg-muted border-t">
              {columns.map(({ key, align, renderCell }, colIndex) => (
                <td
                  key={colIndex}
                  align={align}
                  className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
                >
                  {renderCell ? renderCell(row) : String(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
