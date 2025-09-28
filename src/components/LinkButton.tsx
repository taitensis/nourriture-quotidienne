import * as React from 'react';
import { Button } from '@/components/ui/button';

type Props = React.ComponentProps<typeof Button> & {
  href: string;
  children: React.ReactNode;
};

export default function LinkButton({ href, children, ...btnProps }: Props) {
  return (
    <Button asChild {...btnProps}>
      <a href={href}>{children}</a>
    </Button>
  );
}
