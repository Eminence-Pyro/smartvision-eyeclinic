import { useEffect, useRef } from "react";

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  onVisible?: () => void;
}

export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { threshold = 0.1, rootMargin = "100px", onVisible } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && onVisible) {
            onVisible();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, onVisible]);

  return ref;
}
