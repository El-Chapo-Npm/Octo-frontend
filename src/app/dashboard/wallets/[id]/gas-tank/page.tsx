"use client";

import { use } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useWallet } from "@/lib/useWallet";
import { WalletSidebar } from "@/components/dashboard/WalletSidebar";
import { DashboardBackground } from "@/components/dashboard/DashboardBackground";
import { GasTankProvision } from "@/components/gas/GasTankProvision";
import { PageSpinner } from "@/components/OctoSpinner";

export default function GasTankPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, token, loading, logout } = useAuth();
  const { wallet } = useWallet(id);

  if (loading || !user || !token) return <PageSpinner />;

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <DashboardBackground />
      <div className="relative z-10 flex flex-1">
        <WalletSidebar walletId={id} walletName={wallet?.label ?? "Master wallet"} />
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Link href="/dashboard" className="hover:text-foreground">
                My Wallets
              </Link>
              <span>›</span>
              <span className="text-foreground">Gas tank</span>
            </div>
            <button onClick={logout} className="text-sm text-muted hover:text-foreground">
              ⏻
            </button>
          </header>
          <main className="flex-1 px-8 py-8">
            <div className="mx-auto max-w-2xl space-y-6">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Gas tank</h1>
                <p className="mt-1 text-sm text-muted">
                  Set up the tank that powers{" "}
                  <Link href={`/dashboard/wallets/${id}/sponsorship`} className="underline">
                    gas sponsorship
                  </Link>
                  .
                </p>
              </div>
              <GasTankProvision token={token} walletId={id} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
