export interface ServerCapabilities {
  aiConfigured: boolean;
  geminiConfigured: boolean;
  openaiConfigured: boolean;
  stripeConfigured: boolean;
  githubConfigured: boolean;
  emailConfigured: boolean;
  activeModel: string;
  models?: {
    gemini: string;
    openai: string;
  };
  configuredGithubRepo?: string | null;
  pingResult?: {
    ok: boolean;
    model: string;
    latencyMs?: number;
    error?: string;
  } | null;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}
