import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '../services/api';
import { queryKeys } from './queryKeys';

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: queryKeys.globalSearch(debouncedQuery),
    queryFn: () => globalSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });
}
