import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as api from '../services/api';
import { HassEntity } from '../types/homeassistant';

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
      setError(err instanceof Error ? err.message : 'Failed to fetch entities');
      setIsConnected(false);
    }
  }, []);

  const callService = async (domain: string, service: string, serviceData?: any) => {
    try {
      await api.callService(domain, service, serviceData);
      await refreshEntities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to call service');
      throw err;
    }
  };

  const logout = async () => {
    try {
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
          await refreshEntities();
        } else {
          setError(verification.error || 'Connection failed');
          setIsConnected(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check connection');
      setHasToken(false);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkTokenStatus();

    const interval = setInterval(() => {
      if (hasToken) {
        refreshEntities();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [hasToken, refreshEntities]);

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
