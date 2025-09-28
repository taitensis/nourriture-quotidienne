import * as React from 'react';
import { Check, Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Item = { label: string; url: string; current: boolean };

export default function LangMenu({ items, currentLabel }: { items: Item[]; currentLabel: string }) {
  // Navigate while keeping ?query and #hash
  const go = React.useCallback((href: string) => {
    const target = new URL(href, document.baseURI);
    target.search = location.search;
    target.hash = location.hash;
    location.assign(target.toString());
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:hover:text-primary text-foreground inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent font-medium transition-colors hover:bg-transparent dark:hover:bg-transparent"
        aria-label="Change language"
      >
        <Languages className="h-5 w-5" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="">
        <DropdownMenuGroup>
          {items.map((it) => (
            <DropdownMenuItem
              key={it.label}
              onSelect={() => go(it.url)}
              aria-current={it.current ? 'true' : undefined}
              className={[
                'flex w-full items-center justify-between',
                it.current ? 'text-primary font-semibold' : '',
              ].join(' ')}
            >
              <span>{it.label}</span>
              {it.current && <Check className="h-4 w-4 opacity-80" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
