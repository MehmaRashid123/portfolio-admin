type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...init } = options;
  let url = path;

  if (params) {
    const qs = new URLSearchParams(params).toString();
    url = `${path}?${qs}`;
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) =>
    apiFetch<T>(path, { method: 'GET', params }),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
