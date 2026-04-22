import axios from "axios";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

type SellerAnalyticsData = {
  totalProducts: number;
  activeProducts: number;
  totalSoldOrders: number;
  pendingOrders: number;
  completedOrders: number;
  disputedOrders: number;
  refundedOrders: number;
  completedRevenue: number;
};

type SellerTransaction = {
  _id: string;
  transactionId: string;
  buyer: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: string;
  product?: {
    name?: string;
  };
};

const defaultAnalytics: SellerAnalyticsData = {
  totalProducts: 0,
  activeProducts: 0,
  totalSoldOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  disputedOrders: 0,
  refundedOrders: 0,
  completedRevenue: 0,
};

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-xs text-neutral-400">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
    </div>
  );
}

export default function SellerAnalytics() {
  const { address } = useAccount();

  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] =
    useState<SellerAnalyticsData>(defaultAnalytics);
  const [recentTransactions, setRecentTransactions] = useState<
    SellerTransaction[]
  >([]);

  useEffect(() => {
    if (!address) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/seller-analytics", {
          params: {
            address: address.toLowerCase(),
          },
        });

        setAnalytics(res.data.analytics);
        setRecentTransactions(res.data.recentTransactions || []);
      } catch (error) {
        console.error("Failed to fetch seller analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 5000);

    return () => clearInterval(interval);
  }, [address]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Seller Analytics</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Overview of your listings and sales performance.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-sm text-neutral-400">Loading analytics...</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={analytics.totalProducts} />
        <StatCard title="Active Products" value={analytics.activeProducts} />
        <StatCard title="Total Sold Orders" value={analytics.totalSoldOrders} />
        <StatCard
          title="Completed Revenue"
          value={`${analytics.completedRevenue} MNEE`}
        />
        <StatCard title="Pending Orders" value={analytics.pendingOrders} />
        <StatCard title="Completed Orders" value={analytics.completedOrders} />
        <StatCard title="Disputed Orders" value={analytics.disputedOrders} />
        <StatCard title="Refunded Orders" value={analytics.refundedOrders} />
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            Recent Transactions
          </h3>
          <p className="text-sm text-neutral-400">
            Latest successful seller-side transaction activity.
          </p>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-sm text-neutral-400">No recent transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-3 pr-4">Transaction</th>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Buyer</th>
                  <th className="py-3 pr-4">Quantity</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-0">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="border-b border-neutral-800 last:border-b-0"
                  >
                    <td className="py-3 pr-4 text-white">
                      #{transaction.transactionId}
                    </td>
                    <td className="py-3 pr-4 text-white">
                      {transaction.product?.name || "Unknown Product"}
                    </td>
                    <td className="py-3 pr-4 text-neutral-300">
                      {shortAddress(transaction.buyer)}
                    </td>
                    <td className="py-3 pr-4 text-neutral-300">
                      {transaction.quantity}
                    </td>
                    <td className="py-3 pr-4 text-neutral-300">
                      {transaction.quantity * Number(transaction.price)} MNEE
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-md border border-neutral-700 px-2 py-1 text-xs text-neutral-300">
                        {transaction.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-0 text-neutral-400">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}