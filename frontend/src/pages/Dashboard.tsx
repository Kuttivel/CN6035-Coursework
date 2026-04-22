import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";

import CreateProduct from "../components/layout/CreateProducts";
import Orders from "../components/layout/Orders";
import SellerAnalytics from "../components/layout/SellerAnalytics";
import { AccountConnectButton } from "../components/ui/ConnectButton";
import useReadBalance from "../contracts/hooks/useReadBalance";

export default function Dashboard() {
  const { isConnected } = useAccount();
  const [openOrderOverlay, setOpenOrderOverlay] = useState(false);
  const [openListingForm, setOpenListingForm] = useState(false);

  const readBalance = useReadBalance();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="RowMart" className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-semibold">Seller Dashboard</h1>
              <p className="text-xs text-neutral-400">
                Manage products, orders, and analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 transition text-sm"
            >
              Marketplace
            </Link>

            <button
              onClick={() => setOpenOrderOverlay(true)}
              className="px-4 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 transition text-sm"
            >
              My Orders
            </button>

            <button
              onClick={() => setOpenListingForm(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-sm font-medium"
            >
              Quick Sell
            </button>

            <AccountConnectButton readBalance={readBalance} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isConnected ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center">
            <h2 className="text-xl font-semibold">Connect your wallet</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Please connect your wallet to access seller tools.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <SellerAnalytics />
          </div>
        )}
      </main>

      {openOrderOverlay && (
        <Orders setOpenOrderOverlay={setOpenOrderOverlay} />
      )}

      {openListingForm && (
        <CreateProduct
          setOpenListingForm={setOpenListingForm}
          readBalance={readBalance}
        />
      )}
    </div>
  );
}