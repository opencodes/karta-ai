const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export type User = {
  id: string;
  email: string;
  role: 'admin' | 'member';
};

export type TaskItem = {
  id: string;
  rawInput: string;
  title: string;
  category: 'Finance' | 'Personal' | 'Work' | 'Contact' | 'General';
  dueDate: string;
  featured: boolean;
  status: 'pending' | 'done';
  createdAt: string;
  updatedAt: string;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  token?: string | null;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  return request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function me(token: string): Promise<{ user: User }> {
  return request('/api/auth/me', { token });
}

export async function createTask(token: string, rawInput: string): Promise<{ task: TaskItem }> {
  return request('/api/tasks/parse-create', {
    method: 'POST',
    token,
    body: { rawInput },
  });
}

export async function listTasks(token: string, bucket: 'all' | 'now' | 'later' | 'featured' = 'all'): Promise<{ tasks: TaskItem[] }> {
  return request(`/api/tasks?bucket=${bucket}`, { token });
}

export async function featureTask(token: string, id: string, featured: boolean): Promise<{ task: TaskItem }> {
  return request(`/api/tasks/${id}/feature`, {
    method: 'PATCH',
    token,
    body: { featured },
  });
}
