import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Search, X } from 'lucide-react';
import { Input } from '../ui/Field';
import { TableSkeleton } from './States';
import { EmptyState } from './States';
import { ErrorState } from './States';
import { cn } from '../../utils/cn';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  sortBy,
  sortDir,
  onSortChange,
  page = 1,
  pageSize = 10,
  total = data.length,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  onRowClick,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(total, page * pageSize);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      {(onSearchChange || filters) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
          {onSearchChange && (
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 pr-8"
                aria-label="Search table"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60">
              {columns.map((column) => (
                <th key={column.key} className={cn('whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted', column.headerClassName)}>
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key)}
                      className="inline-flex items-center gap-1 hover:text-text-primary"
                    >
                      {column.header}
                      <ChevronsUpDown className={cn('h-3.5 w-3.5', sortBy === column.key && 'text-brand-600')} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={isLoading || isError || data.length === 0 ? undefined : 'divide-y divide-border'}>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <TableSkeleton columns={columns.length} />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <ErrorState message={errorMessage} onRetry={onRetry} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn('transition-colors hover:bg-surface-hover', onRowClick && 'cursor-pointer')}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-5 py-3.5 align-middle text-text-secondary', column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-text-muted">
              Showing <span className="font-medium text-text-secondary">{rangeStart}-{rangeEnd}</span> of{' '}
              <span className="font-medium text-text-secondary">{total}</span>
            </p>
            {onPageSizeChange && (
              <label className="flex items-center gap-1.5 text-xs text-text-muted">
                Rows per page
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="h-7 rounded-md border border-border bg-surface px-1.5 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label="Rows per page"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-hover disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-medium text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-hover disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
