import {
  createConnection,
  createLongLivedTokenAuth,
  Connection,
  HassEntities,
  subscribeEntities,
} from 'home-assistant-js-websocket';

let connection: Connection | null = null;

export async function connectWebSocket(url: string, token: string): Promise<Connection> {
  if (connection) {
    return connection;
  }

  const wsUrl = url.replace(/^http/, 'ws');
  const auth = createLongLivedTokenAuth(wsUrl, token);

  try {
    connection = await createConnection({ auth });

    connection.addEventListener('ready', () => {
      console.log('WebSocket connected to Home Assistant');
    });

    connection.addEventListener('disconnected', () => {
      console.log('WebSocket disconnected from Home Assistant');
      connection = null;
    });

    connection.addEventListener('reconnect-error', () => {
      console.error('WebSocket reconnection failed');
      connection = null;
    });

    return connection;
  } catch (error) {
    connection = null;
    throw error;
  }
}

export function disconnectWebSocket() {
  if (connection) {
    connection.close();
    connection = null;
  }
}

export function getConnection(): Connection | null {
  return connection;
}

export function subscribeToEntities(
  conn: Connection,
  callback: (entities: HassEntities) => void
): () => void {
  return subscribeEntities(conn, callback);
}
