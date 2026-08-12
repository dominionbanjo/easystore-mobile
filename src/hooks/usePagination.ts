import { useState, useCallback, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function usePagination(onPageChange?: (page: number) => void) {
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);

  const goToPage = useCallback(
    (nextPage: number) => {
      pageRef.current = nextPage;
      setPage(nextPage);
      onPageChange?.(nextPage);
    },
    [onPageChange],
  );

  const nextPage = useCallback(() => {
    const next = pageRef.current + 1;
    pageRef.current = next;
    setPage(next);
    onPageChange?.(next);
  }, [onPageChange]);

  const reset = useCallback(() => {
    pageRef.current = 1;
    setPage(1);
  }, []);

  return { page, nextPage, goToPage, reset };
}
