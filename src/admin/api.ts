const API_BASE = '/api/admin';

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function clearToken() {
  localStorage.removeItem('admin_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export async function login(username: string, password: string) {
  const data = await request<{ token: string; username: string; role: string }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

export async function verifyAuth() {
  return request<{ username: string; role: string }>('/verify');
}

export type ContentData = Record<string, Record<string, string>>;

export async function getContent() {
  return request<Record<string, ContentData>>('/content');
}

export async function saveContent(content: Record<string, ContentData>) {
  return request<{ success: boolean; message: string }>('/content', {
    method: 'PUT',
    body: JSON.stringify(content),
  });
}

export async function getUsers() {
  return request<{ username: string; role: string }[]>('/users');
}

export async function addUser(username: string, password: string, role = 'admin') {
  return request<{ success: boolean; username: string }>('/users', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  });
}

export async function deleteUser(username: string) {
  return request<{ success: boolean }>(`/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  });
}
