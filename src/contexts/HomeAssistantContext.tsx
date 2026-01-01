import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createConnection,
  subscribeEntities,
  callService,
  Connection,
  HassEntities,
  HassEntity,
} from 'home-assistant-js-websocket';
import { HOME_ASSISTANT_CONFIG, STORAGE_KEYS } from '../config/homeassistant';

interface ConnectionConfig {
  url: string;
  token: string;
}

interface HomeAssistantContextType {
  connection: Connection | null;
  entities: HassEntities;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (config: ConnectionConfig) => Promise<void>;
  disconnect: () => void;
  callService: (domain: string, service: string, serviceData?: any) => Promise<void>;
}

const HomeAssistantContext = createContext<HomeAssistantContextType | undefined>(undefined);

export function useHomeAssistant() {
  const context = useContext(HomeAssistantContext);
  if (!context) {
    throw new Error('useHomeAssistant must be used within HomeAssistantProvider');
  }
  return context;
}

interface HomeAssistantProviderProps {
  children: ReactNode;
}

export function HomeAssistantProvider({ children }: HomeAssistantProviderProps) {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [entities, setEntities] = useState<HassEntities>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async (config: ConnectionConfig) => {
    setIsConnecting(true);
    setError(null);

    try {
      let formattedUrl = config.url.trim();

      // Ensure URL has protocol
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'http://' + formattedUrl;
      }

      // Validate URL format
      try {
        new URL(formattedUrl);
      } catch {
        throw new Error('Invalid URL format. Please enter a valid Home Assistant URL (e.g., http://homeassistant.local:8123)');
      }

      localStorage.setItem(STORAGE_KEYS.HA_URL, formattedUrl);
      localStorage.setItem(STORAGE_KEYS.HA_TOKEN, config.token);

      const conn = await createConnection({
        auth: {
          hassUrl: formattedUrl,
          access_token: config.token,
        },
      });

      setConnection(conn);
      setIsConnected(true);

      subscribeEntities(conn, (ent) => setEntities(ent));

      conn.addEventListener('ready', () => {
        setIsConnected(true);
        setError(null);
      });

      conn.addEventListener('disconnected', () => {
        setIsConnected(false);
      });

      conn.addEventListener('reconnect-error', () => {
        setError('Failed to reconnect to Home Assistant');
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Home Assistant');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (connection) {
      connection.close();
      setConnection(null);
      setIsConnected(false);
      setEntities({});
      localStorage.removeItem(STORAGE_KEYS.HA_URL);
      localStorage.removeItem(STORAGE_KEYS.HA_TOKEN);
    }
  };

  const handleCallService = async (domain: string, service: string, serviceData?: any) => {
    if (!connection) {
      throw new Error('Not connected to Home Assistant');
    }
    await callService(connection, domain, service, serviceData);
  };

  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEYS.HA_URL);
    const savedToken = localStorage.getItem(STORAGE_KEYS.HA_TOKEN);

    // Try localStorage first, then fall back to config file
    const urlToUse = savedUrl || HOME_ASSISTANT_CONFIG.url;
    const tokenToUse = savedToken || HOME_ASSISTANT_CONFIG.token;

    if (urlToUse && tokenToUse) {
      connect({ url: urlToUse, token: tokenToUse }).catch(() => {
        // Clear invalid saved credentials
        localStorage.removeItem(STORAGE_KEYS.HA_URL);
        localStorage.removeItem(STORAGE_KEYS.HA_TOKEN);
      });
    }

    return () => {
      if (connection) {
        connection.close();
      }
    };
  }, []);

  return (
    <HomeAssistantContext.Provider
      value={{
        connection,
        entities,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
        callService: handleCallService,
      }}
    >
      {children}
    </HomeAssistantContext.Provider>
  );
}
