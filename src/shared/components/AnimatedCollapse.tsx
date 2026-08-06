import { useEffect, useState, type ReactNode } from 'react';

import './AnimatedCollapse.css';

const COLLAPSE_ANIMATION_DURATION_MS = 240;

interface AnimatedCollapseProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;

  /**
   * Removes collapsed children from the DOM after the closing animation.
   * Useful for large or expensive content such as quest lists.
   */
  unmountOnExit?: boolean;
}

export function AnimatedCollapse({
  isOpen,
  children,
  className,
  unmountOnExit = false,
}: AnimatedCollapseProps) {
  const [shouldRenderChildren, setShouldRenderChildren] = useState(
    () => !unmountOnExit || isOpen,
  );

  useEffect(() => {
    if (!unmountOnExit) {
      return;
    }

    const delay = isOpen ? 0 : COLLAPSE_ANIMATION_DURATION_MS;

    const timeoutId = window.setTimeout(() => {
      setShouldRenderChildren(isOpen);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, unmountOnExit]);

  const hasRenderedChildren = !unmountOnExit || shouldRenderChildren;

  /*
   * When opening lazy content, mount the children before applying the open
   * class. This gives the browser a closed starting state to animate from.
   */
  const isVisiblyOpen = isOpen && hasRenderedChildren;

  return (
    <div
      className={[
        'animated-collapse',
        isVisiblyOpen ? 'animated-collapse--open' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
    >
      <div className="animated-collapse__inner">
        {hasRenderedChildren ? children : null}
      </div>
    </div>
  );
}
