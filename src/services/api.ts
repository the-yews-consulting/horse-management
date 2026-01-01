const API_BASE_URL = 'http://localhost:3000/api';

export interface TokenConfig {
  token: string;
  url?: string;
}

export interface ConfigStatus {
  hasToken: boolean;
  url: string;
}

export interface VerifyResponse {
  success: boolean;
  error?: string;
}

export async function saveToken(config: TokenConfig): Promise<{ success: boolean; message?: string; error?: string }> {
  const response = await fetch(`${API_BASE_URL}/config/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  return await response.json();
}

export async function getTokenStatus(): Promise<ConfigStatus> {
  const response = await fetch(`${API_BASE_URL}/config/token`);
  return await response.json();
}

export async function deleteToken(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/config/token`, {
    method: 'DELETE',
  });
  return await response.json();
}

export async function verifyConnection(): Promise<VerifyResponse> {
  const response = await fetch(`${API_BASE_URL}/verify`);
  return await response.json();
}

export async function getStates(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/states`);
  if (!response.ok) {
    throw new Error('Failed to fetch states');
  }
  return await response.json();
}

export async function getState(entityId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/states/${entityId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch state');
  }
  return await response.json();
}

export async function callService(domain: string, service: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/services/${domain}/${service}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to call service');
  }

  return await response.json();
}
