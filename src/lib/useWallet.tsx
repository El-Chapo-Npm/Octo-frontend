"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getWallet, type WalletView } from "./wallets";
import { useAuth } from "./useAuth";
import { ApiError } from "./api";

type WalletContextValue = {
  wallet: WalletView | null;
  loading: boolean;
  error: Error | null;
  notFound: boolean;
  refresh: () => void;
  update: (wallet: WalletView) => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ walletId, children }: { walletId: string; children: ReactNode }) {
  const { token } = useAuth();
  const [wallet, setWallet] = useState<WalletView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);
    getWallet(token, walletId)
      .then((value) => {
        if (!cancelled) setWallet(value);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setWallet(null);
          setError(cause instanceof Error ? cause : new Error("Could not load wallet."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, walletId, reloadKey]);

  const value = useMemo<WalletContextValue>(() => ({
    wallet,
    loading,
    error,
    notFound: !loading && wallet === null && (error === null || (error instanceof ApiError && error.status === 404)),
    refresh: () => setReloadKey((key) => key + 1),
    update: setWallet,
  }), [wallet, loading, error]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(id: string): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error(`useWallet(${id}) must be used inside a wallet layout`);
  }
  return context;
}
