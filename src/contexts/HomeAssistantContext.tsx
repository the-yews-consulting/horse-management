import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import * as api from '../services/api';
import { HassEntity } from '../types/homeassistant';
import { connectWebSocket, disconnectWebSocket, subscribeToEntities } from '../services/websocket';
import { Connection, HassEntities } from 'home-assistant-js-websocket';

interface HomeAssistantContextType {
  entities: Record<string, HassEntity>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasToken: boolean;
  refreshEntities: () => Promise<void>;
  callService: (domain: string, service: string, serviceData?: any) => Promise<void>;
  logout: () => Promise<void>;
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
  const [entities, setEntities] = useState<Record<string, HassEntity>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const connectionRef = useRef<Connection | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const refreshEntities = useCallback(async () => {
    try {
      const states = await api.getStates();
      const entitiesMap: Record<string, HassEntity> = {};
      states.forEach((state: HassEntity) => {
        entitiesMap[state.entity_id] = state;
      });
      setEntities(entitiesMap);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('not configured')) {
        setIsConnected(false);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch entities');
        setIsConnected(false);
      }
    }
  }, []);

  const handleEntitiesUpdate = useCallback((hassEntities: HassEntities) => {
    setEntities(hassEntities as Record<string, HassEntity>);
    setIsConnected(true);
    setError(null);
  }, []);

  const setupWebSocket = useCallback(async () => {
    try {
      const wsConfig = await api.getWebSocketConfig();

      if (!wsConfig.url || !wsConfig.token) {
        throw new Error('WebSocket configuration is incomplete');
      }

      const conn = await connectWebSocket(wsConfig.url, wsConfig.token);
      connectionRef.current = conn;

      const unsubscribe = subscribeToEntities(conn, handleEntitiesUpdate);
      unsubscribeRef.current = unsubscribe;

      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect via WebSocket');
      setIsConnected(false);

      try {
        await refreshEntities();
      } catch (refreshErr) {
        console.error('Failed to refresh entities:', refreshErr);
      }
    }
  }, [handleEntitiesUpdate, refreshEntities]);

  const cleanupWebSocket = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (connectionRef.current) {
      disconnectWebSocket();
      connectionRef.current = null;
    }
  }, []);

  const callService = async (domain: string, service: string, serviceData?: any) => {
    try {
      await api.callService(domain, service, serviceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to call service');
      throw err;
    }
  };

  const logout = async () => {
    try {
      cleanupWebSocket();
      await api.deleteToken();
      setHasToken(false);
      setEntities({});
      setIsConnected(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  };

  const checkTokenStatus = async () => {
    try {
      const status = await api.getTokenStatus();
      setHasToken(status.hasToken);

      if (status.hasToken) {
        const verification = await api.verifyConnection();
        if (verification.success) {
          try {
            await setupWebSocket();
          } catch (wsErr) {
            console.error('WebSocket setup failed, using polling:', wsErr);
          }
        } else {
          setError(verification.error || 'Connection failed');
          setIsConnected(false);
        }
      } else {
        setIsConnected(false);
        setError(null);
      }
    } catch (err) {
      console.error('Token status check failed:', err);
      setHasToken(false);
      setIsConnected(false);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkTokenStatus();

    return () => {
      cleanupWebSocket();
    };
  }, []);

  useEffect(() => {
    if (hasToken && !connectionRef.current) {
      setupWebSocket();
    }
  }, [hasToken, setupWebSocket]);

  return (
    <HomeAssistantContext.Provider
      value={{
        entities,
        isConnected,
        isLoading,
        error,
        hasToken,
        refreshEntities,
        callService,
        logout,
      }}
    >
      {children}
    </HomeAssistantContext.Provider>
  );
}
