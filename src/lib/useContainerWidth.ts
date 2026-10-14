import { useEffect, useRef, useState } from 'react';

/**
 * Observes the width of the attached element so windowed apps can adapt their
 * layout (e.g. collapse a fixed-width sidebar) when the OS window is resized
 * small or snapped to a quarter tile. Returns [ref, width].
 */
export function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Report the initial size immediately (ResizeObserver only fires on change).
    setWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
