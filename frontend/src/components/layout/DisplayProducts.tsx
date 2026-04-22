import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import ProductDetails from "../ui/ProductDetails";
import useCreateTransaction from "../../contracts/hooks/useCreateTransaction";
import { eventBus } from "../../lib/eventBus";
import resolveProductImage from "../../utils/resolveProductImage";

export default function DisplayProducts({ query }: { query: string | null }) {
  const { address } = useAccount();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [createTransactionSeccessful, setCreateTransactionSeccessful] =
    useState<boolean | null>(null);
  const [pendingTransactionId, setPendingTransactionId] = useState<
    string | null
  >(null);

  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const { approveAndBuy, isPending } = useCreateTransaction();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get("/get-products", {
        params: {
          active: true,
          search: query ?? undefined,
          page: pagination.page,
        },
      });

      setProducts(res.data.products);
      setPagination((p: PaginationMeta) => ({
        ...p,
        page: res.data.meta.page,
        totalPages: res.data.meta.totalPages,
        total: res.data.meta.total,
      }));
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, [query, pagination.page]);

  useEffect(() => {
    fetchProducts();

    const interval = setInterval(() => {
      fetchProducts();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchProducts]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [query]);

  useEffect(() => {
    if (!disableSubmit) return;
    if (createTransactionSeccessful === null) return;

    if (createTransactionSeccessful) {
      toast.success("Purchase successful", { id: "buy-product" });

      setTimeout(() => {
        fetchProducts();
      }, 2000);
    } else {
      toast.error("Blockchain transaction failed", {
        id: "buy-product",
      });
    }

    setDisableSubmit(false);
    setSelectedProduct(null);
    setPendingTransactionId(null);
    setCreateTransactionSeccessful(null);
  }, [createTransactionSeccessful, disableSubmit, fetchProducts]);

  const rollbackPendingTransaction = async (transactionId?: string | null) => {
    if (!transactionId) return;

    try {
      await axios.delete("/delete-transaction", {
        data: { id: transactionId },
      });
    } catch (error) {
      console.error("Failed to rollback pending transaction", error);
    }
  };

  const buyProduct = async (
    product: Product,
    quantity: number,
    buyerEmail: string,
    price: number
  ) => {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    if (address.toLowerCase() === product.seller.toLowerCase()) {
      toast("You can't buy your own product");
      return;
    }

    let createdTransactionId: string | null = null;

    try {
      setDisableSubmit(true);
      setCreateTransactionSeccessful(null);
      setPendingTransactionId(null);

      toast.loading("Processing transaction...", { id: "buy-product" });

      const res = await axios.post("/create-transaction", {
        productId: product._id,
        price: Number(product.price),
        quantity,
        seller: product.seller,
        buyer: address,
        buyerEmail,
      });

      localStorage.setItem("user-email", buyerEmail);

      const { detailsCid, _id } = res.data.transaction;
      createdTransactionId = _id;
      setPendingTransactionId(_id);

      if (!product.productId || Number(product.productId) <= 0) {
        throw new Error("Invalid productId");
      }

      await approveAndBuy(
        BigInt(product.productId),
        quantity,
        detailsCid,
        price.toString(),
        setCreateTransactionSeccessful
      );
    } catch (err: any) {
      await rollbackPendingTransaction(createdTransactionId);

      setDisableSubmit(false);
      setPendingTransactionId(null);
      setCreateTransactionSeccessful(null);

      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Transaction failed",
        {
          id: "buy-product",
        }
      );
    }
  };

  useEffect(() => {
    setUserEmail(localStorage.getItem("user-email") ?? "");
  }, []);

  useEffect(() => {
    const handleFetchProducts = () => {
      fetchProducts();
    };

    eventBus.on("FETCH_PRODUCTS", handleFetchProducts);

    return () => {
      eventBus.off("FETCH_PRODUCTS", handleFetchProducts);
    };
  }, [fetchProducts]);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product._id}
              className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 hover:shadow-xl transition cursor-pointer"
            >
              <div
                className="relative h-48 overflow-hidden"
                onClick={() => setSelectedProduct(product)}
              >
                <img
                  src={resolveProductImage(product)}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition"
                />
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h3 className="font-medium text-sm truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {product.price} MNEE
                  </p>
                </div>

                <button
                  onClick={() => setSelectedProduct(product)}
                  className="mt-auto bg-emerald-600 hover:bg-emerald-500 text-xs py-2 rounded-lg transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-neutral-500 h-[40vh]">
            <p>No products available</p>
            <p className="text-xs mt-1">Check back later</p>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pb-6">
          <button
            disabled={pagination.page === 1}
            onClick={() =>
              setPagination((p) => ({
                ...p,
                page: Math.max(p.page - 1, 1),
              }))
            }
            className="px-4 py-2 text-xs rounded-lg border border-neutral-700 disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-xs text-neutral-400">
            Page <span className="text-white">{pagination.page}</span> of{" "}
            {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() =>
              setPagination((p) => ({
                ...p,
                page: Math.min(p.page + 1, p.totalPages),
              }))
            }
            className="px-4 py-2 text-xs rounded-lg border border-neutral-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {selectedProduct && (
        <ProductDetails
          setSelectedProduct={setSelectedProduct}
          product={selectedProduct}
          buyProduct={buyProduct}
          disableSubmit={isPending || disableSubmit}
          defaultEmail={userEmail}
        />
      )}
    </div>
  );
}