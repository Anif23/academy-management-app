import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { cn } from '../../utils/cn';

interface ResultGroup {
  label: string;
  basePath: string;
  items: Array<{ id: string; title: string; subtitle: string }>;
}

interface GlobalSearchProps {
  onNavigate?: () => void;
  autoFocus?: boolean;
}

export function GlobalSearch({ onNavigate, autoFocus }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useGlobalSearch(query);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groups: ResultGroup[] = data
    ? [
        { label: 'Students', basePath: '/students', items: data.students },
        { label: 'Walk-ins', basePath: '/walk-ins', items: data.walkIns },
        { label: 'Batches', basePath: '/batches', items: data.batches },
        { label: 'Employees', basePath: '/employees', items: data.employees },
      ].filter((group) => group.items.length > 0)
    : [];

  const hasQuery = query.trim().length > 0;
  const hasResults = groups.length > 0;

  function handleSelect(basePath: string, id: string) {
    setOpen(false);
    setQuery('');
    onNavigate?.();
    navigate(basePath === '/students' ? `/students/${id}` : basePath);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      (event.target as HTMLInputElement).blur();
    }
  }

  return (
    <div ref={containerRef} className="relative w-full md:max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search students, batches, employees..."
          aria-label="Global search"
          className="h-10 w-full rounded-lg border border-border bg-surface-muted pl-9 pr-8 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && hasQuery && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border bg-surface shadow-popover animate-fade-in">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {groups.map((group) => (
                <div key={group.label} className="px-2 py-1">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted">{group.label}</p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(group.basePath, item.id)}
                      className={cn(
                        'flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-hover',
                      )}
                    >
                      <span className="text-sm font-medium text-text-primary">{item.title}</span>
                      <span className="text-xs text-text-muted">{item.subtitle}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-text-muted">No results for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}
