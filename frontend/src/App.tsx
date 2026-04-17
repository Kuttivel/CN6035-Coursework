import { useConnect, useConnection } from "wagmi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import CreateProduct from "./components/layout/CreateProducts";
import DisplayProducts from "./components/layout/DisplayProducts";
import Orders from "./components/layout/Orders";
import { AccountConnectButton } from "./components/ui/ConnectButton";

import useReadBalance from "./contracts/hooks/useReadBalance";
import { useWatchTokenTransfers } from "./contracts/hooks/events/TransferEvents";
import axios from "axios";
import { useWatchTokenApproval } from "./contracts/hooks/events/ApprovalEvents";
import { Menu } from "lucide-react";
import MobileMenu from "./components/ui/MobileMenu";
import { useWatchProductCreated } from "./contracts/hooks/events/ProductCreatedEvents";
import { Link } from "react-router-dom";

async function wakeServer(setServerActive: Dispatch<SetStateAction<boolean>>) {
  while (true) {
    try {
      const res = await axios.get("health");
      if (res.data.status === "ok") {
        setServerActive(true);
        return;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 7000));
  }
}

function App() {
  const { address, isConnected } = useConnection();
  const { error } = useConnect();

  const [openListingForm, setOpenListingForm] = useState(false);
  const [openOrderOverlay, setOpenOrderOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [serverActive, setServerActive] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const readBalance = useReadBalance();

  // TODO: Listen to product and transaction event and update on frontend update

  /* ----------------------- Watch Transfers ----------------------- */

  useWatchTokenTransfers(address, () => {
    readBalance.refetchBalance();
    readBalance.refetchEthBalance();
  });

  useWatchTokenApproval(address);

  useWatchProductCreated();

  useEffect(() => {
    wakeServer(setServerActive);
  }, []);

  useEffect(() => {
    document.body.style.overflow = openMenu ? "hidden" : "auto";
  }, [openMenu]);

  /* ----------------------------- UI ------------------------------ */

  if (!serverActive)
    return (
      <div className="min-h-screen bg-neutral-950">
        {/* Brand */}
        <div className="p-5 flex items-center gap-3">
          <img src="logo.png" alt="RowMart" className="w-8 h-8" />
          <h1 className="text-xl font-semibold tracking-tight">RowMart</h1>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-1/2 text-neutral-500">
          Server is starting. Please wait.
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-8 h-8" />
            <h1 className="hidden lg:block text-xl font-semibold">RowMart</h1>
          </div>

          {/* Search (hidden on mobile when menu open) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <input
              type="search"
              placeholder="Search products…"
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm"
            />
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-xs text-gray-500 hover:text-indigo-500 transition-colors duration-300 transform hover:scale-105"
            >
              Dashboard
            </Link>
            <button
              onClick={() => setOpenOrderOverlay(true)}
              className="px-4 py-2 rounded-lg border border-neutral-800"
            >
              Orders
            </button>

            <AccountConnectButton readBalance={readBalance} />

            {isConnected && (
              <button
                onClick={() => setOpenListingForm(true)}
                className="bg-emerald-600 px-4 py-2 rounded-lg font-medium"
              >
                Sell Now
              </button>
            )}
          </div>

          {/* Mobile menu icon */}
          <button className="lg:hidden" onClick={() => setOpenMenu(true)}>
            <Menu />
          </button>
        </div>
      </header>

      <MobileMenu
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        onOrders={() => setOpenOrderOverlay(true)}
        onSell={() => setOpenListingForm(true)}
        isConnected={isConnected}
        readBalance={readBalance}
      />

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-600/20 border border-red-600/40 text-red-400 text-sm px-4 py-2 rounded-lg">
            {error.message}
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto">
        {/* Create Product Modal */}
        {openListingForm && (
          <CreateProduct
            setOpenListingForm={setOpenListingForm}
            readBalance={readBalance}
          />
        )}

        {/* Orders Overlay */}
        {openOrderOverlay && (
          <Orders setOpenOrderOverlay={setOpenOrderOverlay} />
        )}

        {/* Products */}
        <DisplayProducts query={searchQuery} />
      </main>
    </div>
  );
}

export default App;
