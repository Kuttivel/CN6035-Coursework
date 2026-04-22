import axios from "axios";
import { X } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import useConfirmDelivery from "../../contracts/hooks/useConfirmDelivery";
import useCreateDispute from "../../contracts/hooks/useCreateDispute";
import useRefundTransaction from "../../contracts/hooks/useRefundTransaction";
import resolveProductImage from "../../utils/resolveProductImage";

const shortAddress = (addr?: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

const statusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-600/20 text-green-400 border-green-600/40";
    case "pending":
      return "bg-yellow-600/20 text-yellow-400 border-yellow-600/40";
    case "refunded":
      return "bg-red-600/20 text-red-400 border-red-600/40";
    case "disputed":
      return "bg-purple-600/20 text-purple-400 border-purple-600/40";
    default:
      return "bg-neutral-700/20 text-neutral-400 border-neutral-700";
  }
};

export default function Orders({
  setOpenOrderOverlay,
}: {
  setOpenOrderOverlay: Dispatch<SetStateAction<boolean>>;
}) {
  const { address } = useAccount();

  const [isSeller, setIsSeller] = useState<boolean | null>(false);
  const [status, setStatus] = useState<OrderStatus>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmingId, setConfirmingId] = useState<string>("");
  const [disputingId, setDisputingId] = useState<string>("");
  const [refundingId, setRefundingId] = useState<string>("");

  const { confirmDelivery } = useConfirmDelivery();
  const { createDispute } = useCreateDispute();
  const { refundTransaction } = useRefundTransaction();

  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchOrders = useCallback(async () => {
    if (!address) return;

    try {
      setLoading(true);

      const res = await axios.get("/get-transactions", {
        params: {
          success: true,
          address: address.toLowerCase(),
          isSeller,
          status: status === "all" ? undefined : status,
          page: pagination.page,
        },
      });

      setOrders(res.data.transactions);
      setPagination((p: PaginationMeta) => ({
        ...p,
        page: res.data.meta.page,
        totalPages: res.data.meta.totalPages,
        total: res.data.meta.total,
      }));
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  }, [address, isSeller, status, pagination.page]);

  useEffect(() => {
    if (!address) return;

    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchOrders, address]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [status, isSeller]);

  async function deliveryConfirmation(order: Order) {
    if (!address) return;
    if (order.buyer.toLowerCase() !== address.toLowerCase()) return;
    if (order.status !== "pending") return;

    const confirmed = confirm("Confirm you have received this product?");
    if (!confirmed) return;

    try {
      setConfirmingId(order._id);

      toast.loading("Confirming delivery...", {
        id: "delivery-confirmation",
      });

      await confirmDelivery(order.transactionId);

      toast.success("Delivery transaction submitted", {
        id: "delivery-confirmation",
      });

      setTimeout(() => {
        fetchOrders();
      }, 2000);
    } catch (err) {
      console.error("Confirm delivery failed", err);
      toast.error("Delivery confirmation failed", {
        id: "delivery-confirmation",
      });
    } finally {
      setConfirmingId("");
    }
  }

  async function openDispute(order: Order) {
    if (!address) return;
    if (order.status !== "pending") return;

    const currentUser = address.toLowerCase();
    const canDispute =
      order.buyer.toLowerCase() === currentUser ||
      order.seller.toLowerCase() === currentUser;

    if (!canDispute) return;

    try {
      setDisputingId(order._id);

      toast.loading("Creating dispute...", {
        id: "dispute",
      });

      await createDispute(order.transactionId);

      toast.success("Dispute opened!", {
        id: "dispute",
      });

      setTimeout(() => {
        fetchOrders();
      }, 2000);
    } catch (err) {
      console.error("Failed to create dispute", err);
      toast.error("Failed to create dispute", {
        id: "dispute",
      });
    } finally {
      setDisputingId("");
    }
  }

  async function refundPendingOrder(order: Order) {
    if (!address) return;
    if (order.seller.toLowerCase() !== address.toLowerCase()) return;
    if (order.status !== "pending") return;

    const confirmed = confirm("Refund this pending order to the buyer?");
    if (!confirmed) return;

    try {
      setRefundingId(order._id);

      toast.loading("Refunding order...", {
        id: "refund-order",
      });

      await refundTransaction(order.transactionId);

      toast.success("Refund transaction submitted", {
        id: "refund-order",
      });

      setTimeout(() => {
        fetchOrders();
      }, 2000);
    } catch (err) {
      console.error("Refund failed", err);
      toast.error("Refund failed", {
        id: "refund-order",
      });
    } finally {
      setRefundingId("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="relative bg-neutral-950 md:w-140 w-full max-h-[90vh] rounded-2xl border border-neutral-800 p-6 flex flex-col gap-6">
        <X
          className="absolute right-5 top-5 cursor-pointer text-red-500"
          onClick={() => setOpenOrderOverlay(false)}
        />

        <h2 className="text-lg font-semibold">My Orders</h2>

        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-xs text-neutral-500">Status</p>
            <div className="flex gap-2 text-xs flex-wrap">
              {(
                [
                  "all",
                  "pending",
                  "completed",
                  "refunded",
                  "disputed",
                ] as OrderStatus[]
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1 rounded-md border transition ${
                    status === s
                      ? "bg-green-600 border-green-500"
                      : "border-neutral-700 hover:border-neutral-600"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <span className="text-neutral-500 mr-2">View</span>
            <button
              onClick={() => setIsSeller(false)}
              className={`px-3 py-1 rounded-md border ${
                isSeller === false
                  ? "bg-blue-600 border-blue-500"
                  : "border-neutral-700"
              }`}
            >
              Bought
            </button>
            <button
              onClick={() => setIsSeller(true)}
              className={`px-3 py-1 rounded-md border ${
                isSeller === true
                  ? "bg-purple-600 border-purple-500"
                  : "border-neutral-700"
              }`}
            >
              Sold
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {loading && (
            <p className="text-sm text-neutral-400">Loading orders...</p>
          )}

          {!loading && orders.length === 0 && (
            <p className="text-sm text-neutral-400">No orders found</p>
          )}

          {orders.map((order) => {
            const isSellOrder =
              !!address && address.toLowerCase() === order.seller.toLowerCase();

            const total = order.quantity * Number(order.price);

            return (
              <div
                key={order._id}
                className="flex gap-4 border border-neutral-800 rounded-xl p-4 bg-neutral-900 hover:border-neutral-700 transition"
              >
                <img
                  src={resolveProductImage(order.product)}
                  alt={order.product.name}
                  className="w-20 h-20 rounded-lg object-cover border border-neutral-800"
                />

                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{order.product.name}</p>
                      <p className="text-xs text-neutral-400 line-clamp-1">
                        {order.product.description}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded-md border ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1 text-xs text-neutral-400">
                    <p>Type</p>
                    <p className="text-right">
                      {isSellOrder ? "Sell Order" : "Buy Order"}
                    </p>

                    <p>Quantity</p>
                    <p className="text-right">{order.quantity}</p>

                    <p>Unit Price</p>
                    <p className="text-right">
                      {Number(order.price).toLocaleString()} MNEE
                    </p>

                    <p>Total</p>
                    <p className="text-right font-medium text-neutral-200">
                      {total.toLocaleString()} MNEE
                    </p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {!isSellOrder && order.status === "pending" && (
                      <button
                        onClick={() => deliveryConfirmation(order)}
                        disabled={confirmingId === order._id}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg
                        bg-emerald-600/20 text-emerald-400 border border-emerald-600/40
                        hover:bg-emerald-600/30 disabled:opacity-50"
                      >
                        {confirmingId === order._id
                          ? "Confirming Delivery..."
                          : "Confirm Delivery"}
                      </button>
                    )}

                    {isSellOrder && order.status === "pending" && (
                      <button
                        onClick={() => refundPendingOrder(order)}
                        disabled={refundingId === order._id}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg
                        bg-red-600/20 text-red-400 border border-red-600/40
                        hover:bg-red-600/30 disabled:opacity-50"
                      >
                        {refundingId === order._id
                          ? "Refunding..."
                          : "Refund Buyer"}
                      </button>
                    )}

                    {order.status === "pending" && (
                      <button
                        onClick={() => openDispute(order)}
                        disabled={disputingId === order._id}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg
                        bg-purple-600/20 text-purple-400 border border-purple-600/40
                        hover:bg-purple-600/30 disabled:opacity-50"
                      >
                        {disputingId === order._id
                          ? "Opening..."
                          : "Open Dispute"}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-800">
                    <p>
                      {isSellOrder ? "Buyer" : "Seller"}:{" "}
                      <span className="text-neutral-300">
                        {shortAddress(isSellOrder ? order.buyer : order.seller)}
                      </span>
                    </p>
                    <p>Tx #{order.transactionId}</p>
                  </div>

                  <p className="text-[11px] text-neutral-600 text-right">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-neutral-800">
            <button
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.max(p.page - 1, 1),
                }))
              }
              className="px-4 py-2 text-xs rounded-lg border border-neutral-700
              disabled:opacity-40 hover:border-neutral-500"
            >
              Previous
            </button>

            <span className="text-xs text-neutral-400">
              Page{" "}
              <span className="text-white font-medium">{pagination.page}</span>{" "}
              of {pagination.totalPages}
            </span>

            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.min(p.page + 1, p.totalPages),
                }))
              }
              className="px-4 py-2 text-xs rounded-lg border border-neutral-700
              disabled:opacity-40 hover:border-neutral-500"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}