import { useMemo, useState } from 'react';
import type { QueryParams } from '../types';

export function useTableState(defaults: Partial<QueryParams> = {}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaults.pageSize ?? 10);
  const [sortBy, setSortBy] = useState<string | undefined>(defaults.sortBy);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>((defaults.sortDir as 'asc' | 'desc') ?? 'asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function updatePageSize(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function toggleSort(field: string) {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  }

  const params: QueryParams = useMemo(
    () => ({ page, pageSize, search, sortBy, sortDir, ...filters }),
    [page, pageSize, search, sortBy, sortDir, filters],
  );

  return {
    search,
    setSearch: updateSearch,
    page,
    setPage,
    pageSize,
    setPageSize: updatePageSize,
    sortBy,
    sortDir,
    toggleSort,
    filters,
    setFilter: updateFilter,
    params,
  };
}

