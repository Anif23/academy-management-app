import type { PaginatedResult, QueryParams } from '../types';

export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

interface CrudFactoryOptions<T> {
  load: () => T[];
  save: (items: T[]) => void;
  searchableFields: (item: T) => string[];
}

export function createCrudService<T extends { id: string }>(options: CrudFactoryOptions<T>) {
  const { load, save, searchableFields } = options;

  async function getAll(params: QueryParams = {}): Promise<PaginatedResult<T>> {
    await delay();
    let items = load();

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter((item) => searchableFields(item).some((f) => f.toLowerCase().includes(q)));
    }

    Object.entries(params).forEach(([field, value]) => {
      if (['page', 'pageSize', 'search', 'sortBy', 'sortDir'].includes(field)) return;
      if (value === undefined || value === '' || value === 'all') return;
      items = items.filter((item) => String((item as Record<string, unknown>)[field]) === String(value));
    });

    if (params.sortBy) {
      const sortBy = params.sortBy;
      const dir = params.sortDir === 'desc' ? -1 : 1;
      items = [...items].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortBy];
        const bv = (b as Record<string, unknown>)[sortBy];
        if (av === bv) return 0;
        return (av! > bv! ? 1 : -1) * dir;
      });
    }

    const total = items.length;
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? (total || 1);
    const start = (page - 1) * pageSize;
    const paged = pageSize >= total ? items : items.slice(start, start + pageSize);

    return {
      data: paged,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async function getAllRaw(): Promise<T[]> {
    await delay(150);
    return load();
  }

  async function getById(id: string): Promise<T | null> {
    await delay(200);
    return load().find((item) => item.id === id) ?? null;
  }

  async function create(item: T): Promise<T> {
    await delay();
    const items = load();
    const next = [item, ...items];
    save(next);
    return item;
  }

  async function update(id: string, patch: Partial<T>): Promise<T> {
    await delay();
    const items = load();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Record not found');

    const cleanPatch = Object.fromEntries(Object.entries(patch as Record<string, unknown>).filter(([, v]) => v !== undefined));
    const updated = { ...items[index], ...cleanPatch } as T;
    items[index] = updated;
    save(items);
    return updated;
  }

  async function remove(id: string): Promise<void> {
    await delay();
    const items = load().filter((item) => item.id !== id);
    save(items);
  }

  return { getAll, getAllRaw, getById, create, update, remove };
}
