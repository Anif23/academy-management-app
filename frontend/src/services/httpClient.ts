import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send/receive the httpOnly auth cookies
});

let refreshPromise: Promise<void> | null = null;

function isAuthRoute(url?: string): boolean {
  return Boolean(url && url.startsWith('/auth/'));
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // A 401 on anything other than the auth endpoints themselves means the
    // access token expired mid-session. Try exactly one silent refresh,
    // replay the original request, and only give up (redirecting to login)
    // if the refresh itself fails.
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute(originalRequest.url)) {
      originalRequest._retry = true;

      try {
        refreshPromise = refreshPromise || httpClient.post('/auth/refresh').then(() => undefined);
        await refreshPromise;
        refreshPromise = null;
        return httpClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/** Normalizes any Axios/network error into a plain Error with a readable message. */
export function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
