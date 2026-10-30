import { User, Workflow, Execution, TelemetryMetrics, AiAdvice } from '../types';

const TOKEN_KEY = 'smart_automation_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || (data?.details ? data.details.map((d: any) => d.message).join(', ') : 'Request failed');
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
      const res = await request<{ user: User; token: string; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(res.token);
      return res;
    },

    register: async (email: string, password: string, name: string): Promise<{ user: User; token: string }> => {
      const res = await request<{ user: User; token: string; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      setStoredToken(res.token);
      return res;
    },

    me: async (): Promise<{ user: User }> => {
      return request<{ user: User }>('/api/auth/me');
    },

    logout: () => {
      setStoredToken(null);
    },
  },

  workflows: {
    getAll: async (): Promise<{ workflows: Workflow[] }> => {
      return request<{ workflows: Workflow[] }>('/api/workflows');
    },

    getById: async (id: number): Promise<{ workflow: Workflow }> => {
      return request<{ workflow: Workflow }>(`/api/workflows/${id}`);
    },

    create: async (data: {
      name: string;
      problem_statement: string;
      solution_description?: string;
      is_active?: boolean;
      definition: { steps: any[] };
    }): Promise<{ workflow: Workflow }> => {
      return request<{ workflow: Workflow }>('/api/workflows', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<Workflow>): Promise<{ workflow: Workflow }> => {
      return request<{ workflow: Workflow }>(`/api/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number): Promise<{ message: string }> => {
      return request<{ message: string }>(`/api/workflows/${id}`, {
        method: 'DELETE',
      });
    },

    generateWithAi: async (problem_statement: string): Promise<{
      workflow_name: string;
      problem_statement: string;
      solution_description: string;
      steps: any[];
    }> => {
      return request('/api/workflows/generate-ai', {
        method: 'POST',
        body: JSON.stringify({ problem_statement }),
      });
    },

    execute: async (
      id: number,
      input_payload: any
    ): Promise<{
      execution_id: number;
      status: 'success' | 'failed';
      duration_ms: number;
      step_traces: any[];
      input_payload: any;
      output_payload: any;
      error_message?: string | null;
    }> => {
      return request(`/api/workflows/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify({ input_payload }),
      });
    },

    getExecutions: async (id: number): Promise<{ workflow: { id: number; name: string }; executions: Execution[] }> => {
      return request(`/api/workflows/${id}/executions`);
    },

    getAdvice: async (id: number): Promise<{ advice: AiAdvice }> => {
      return request(`/api/workflows/${id}/advice`, {
        method: 'POST',
      });
    },
  },

  telemetry: {
    getOverview: async (): Promise<{ metrics: TelemetryMetrics; recent_executions: Execution[] }> => {
      return request('/api/workflows/telemetry/overview');
    },
  },
};
