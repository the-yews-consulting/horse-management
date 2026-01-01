import { getConfig } from './database.mjs';

export async function callHomeAssistantAPI(endpoint, method = 'GET', body = null) {
  const token = await getConfig('ha_token');
  const haUrl = await getConfig('ha_url') || 'http://localhost:8123';

  if (!token) {
    throw new Error('Home Assistant token not configured');
  }

  const url = `${haUrl}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Home Assistant API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function getStates() {
  return await callHomeAssistantAPI('/states');
}

export async function getState(entityId) {
  return await callHomeAssistantAPI(`/states/${entityId}`);
}

export async function callService(domain, service, data) {
  return await callHomeAssistantAPI(`/services/${domain}/${service}`, 'POST', data);
}

export async function verifyConnection() {
  try {
    await callHomeAssistantAPI('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAutomations() {
  try {
    const states = await getStates();
    return states.filter(entity => entity.entity_id.startsWith('automation.'));
  } catch (error) {
    throw new Error(`Failed to get automations: ${error.message}`);
  }
}
