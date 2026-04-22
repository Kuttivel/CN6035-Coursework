import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { AccountConnectButton } from "./ConnectButton";
import useReadBalance from "../../contracts/hooks/useReadBalance";

export default function MobileMenu({
  open,
  onClose,
  onOrders,
  onSell,
  isConnected,
  readBalance,
}: {
  open: boolean;
  onClose: () => void;
  onOrders: () => void;
  onSell: () => void;
  isConnected: boolean;
  readBalance: ReturnType<typeof useReadBalance>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden">
      <div className="absolute right-0 top-0 h-full w-80 max-w-full overflow-x-hidden bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            onClick={onClose}
            className="px-4 py-3 rounded-lg border border-neutral-800 bg-neutral-900"
          >
            Marketplace
          </Link>

          <Link
            to="/dashboard"
            onClick={onClose}
            className="px-4 py-3 rounded-lg border border-neutral-800 bg-neutral-900"
          >
            Dashboard
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOrders();
            }}
            className="px-4 py-3 rounded-lg border border-neutral-800 bg-neutral-900 text-left"
          >
            Orders
          </button>

          {isConnected && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSell();
              }}
              className="px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-left"
            >
              Sell Now
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-neutral-800 w-full">
          <AccountConnectButton readBalance={readBalance} compact />
        </div>
      </div>
    </div>
  );
}