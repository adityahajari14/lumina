'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ShopifyCustomer } from '@/lib/shopify';

// ============================================
// Types
// ============================================

interface AuthContextType {
  customer: ShopifyCustomer | null;
  isLoading: boolean;
  refreshCustomer: () => Promise<ShopifyCustomer | null>;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================
// Provider
// ============================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<ShopifyCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCustomer = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });

      if (!response.ok) {
        setCustomer(null);
        return null;
      }

      const payload = await response.json();
      const nextCustomer = (payload.data ?? null) as ShopifyCustomer | null;
      setCustomer(nextCustomer);
      return nextCustomer;
    } catch {
      setCustomer(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ customer, isLoading, refreshCustomer }),
    [customer, isLoading, refreshCustomer]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
