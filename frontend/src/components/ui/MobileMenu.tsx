import { X } from "lucide-react";
import { AccountConnectButton } from "../ui/ConnectButton";


export default function MobileMenu({
  open,
  onClose,
  onOrders,
  onSell,
  isConnected,
  readBalance,
}: MobileMenuProps) {
  return (
    <div
      className={`
        fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur
        transform transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-8 h-8" />
          <span className="font-semibold text-lg">RowMart</span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition"
        >
          <X />
        </button>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-6 p-6 text-lg">
        <button
          onClick={() => {
            onOrders();
            onClose();
          }}
          className="text-left px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 transition"
        >
          Orders
        </button>

        <div className="px-4">
          <AccountConnectButton readBalance={readBalance} />
        </div>

        {isConnected && (
          <button
            onClick={() => {
              onSell();
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-500 px-4 py-3 rounded-xl font-medium transition"
          >
            Sell Now
          </button>
        )}
      </div>
    </div>
  );
}
