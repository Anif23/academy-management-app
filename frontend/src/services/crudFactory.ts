import { httpClient, toErrorMessage } from './httpClient';
import type { PaginatedResult, QueryParams } from '../types';

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
}

/**
 * Creates the same { getAll, getAllRaw, getById, create, update, remove }
 * surface the app's hooks already call — only the implementation moved from
 * localStorage to real HTTP requests against the Express API.
 */
export function createHttpCrudService<T extends { id: string }>(resourcePath: string) {
  async function getAll(params: QueryParams = {}): Promise<PaginatedResult<T>> {
    try {
      const response = await httpClient.get(resourcePath, { params });
      const { data, total, page, pageSize, totalPages } = response.data;
      return { data, total, page, pageSize, totalPages };
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  }

  async function getAllRaw(): Promise<T[]> {
    return unwrap(httpClient.get(`${resourcePath}/all`));
  }

  async function getById(id: string): Promise<T | null> {
    try {
      return await unwrap(httpClient.get(`${resourcePath}/${id}`));
    } catch {
      return null;
    }
  }

  async function create(item: Partial<T>): Promise<T> {
    return unwrap(httpClient.post(resourcePath, item));
  }

  async function update(id: string, patch: Partial<T>): Promise<T> {
    return unwrap(httpClient.patch(`${resourcePath}/${id}`, patch));
  }

  async function remove(id: string): Promise<void> {
    try {
      await httpClient.delete(`${resourcePath}/${id}`);
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  }

  return { getAll, getAllRaw, getById, create, update, remove };
}
