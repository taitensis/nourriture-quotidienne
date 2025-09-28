// src/components/primitives/A.tsx
import * as React from 'react';

type Props = React.ComponentProps<'a'>;

const A = React.forwardRef<HTMLAnchorElement, Props>(function A({ children, ...rest }, ref) {
  return (
    <a ref={ref} {...rest}>
      {children}
    </a>
  );
});

export default A;
