const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getAccessToken = () => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
export const getRefreshToken = () => (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// ── Fetch com JWT e refresh automático ───────────────────────────────────────
async function tryRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = async (token: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_URL}${path}`, { ...options, headers });
  };

  let token = getAccessToken();
  let res = await makeRequest(token);

  // Token expirado — tenta refresh uma vez
  if (res.status === 401) {
    token = await tryRefresh();
    if (!token) {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }
    res = await makeRequest(token);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(err.message ?? 'Erro na requisição');
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (data: { name: string; email: string; password: string; officeName: string }) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  me: () => apiFetch('/users/me'),
};

// ── Clientes ─────────────────────────────────────────────────────────────────
export const clientsApi = {
  list: () => apiFetch('/clients'),
  get: (id: string) => apiFetch(`/clients/${id}`),
  create: (data: any) => apiFetch('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch(`/clients/${id}`, { method: 'DELETE' }),
};

// ── Tarefas ──────────────────────────────────────────────────────────────────
export const tasksApi = {
  list: (params?: { status?: string; assignedToId?: string; clientId?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiFetch(`/tasks${qs}`);
  },
  get: (id: string) => apiFetch(`/tasks/${id}`),
  create: (data: any) => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  remove: (id: string) => apiFetch(`/tasks/${id}`, { method: 'DELETE' }),
};

// ── Obrigações ────────────────────────────────────────────────────────────────
export const obligationsApi = {
  list: () => apiFetch('/obligations'),
  listClientObligations: (params?: { status?: string; clientId?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiFetch(`/obligations/client-obligations${qs}`);
  },
  create: (data: any) => apiFetch('/obligations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/obligations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  assignToClient: (data: any) =>
    apiFetch('/obligations/client-obligations', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/obligations/client-obligations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ── Usuários ─────────────────────────────────────────────────────────────────
export const usersApi = {
  list: () => apiFetch('/users'),
  create: (data: any) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleActive: (id: string) => apiFetch(`/users/${id}/toggle-active`, { method: 'PATCH' }),
  remove: (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

// ── Escritório ────────────────────────────────────────────────────────────────
export const officeApi = {
  get: () => apiFetch('/office'),
  update: (data: any) => apiFetch('/office', { method: 'PUT', body: JSON.stringify(data) }),
  stats: () => apiFetch('/office/stats'),
};
