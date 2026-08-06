import type { ReactNode } from 'react';

import './AnimatedCollapse.css';

interface AnimatedCollapseProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function AnimatedCollapse({
  isOpen,
  children,
  className,
}: AnimatedCollapseProps) {
  return (
    <div
      className={[
        'animated-collapse',
        isOpen ? 'animated-collapse--open' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
    >
      <div className="animated-collapse__inner">{children}</div>
    </div>
  );
}
