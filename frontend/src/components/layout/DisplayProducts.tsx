import axios from "axios";
import { useEffect, useState } from "react";
import ProductDetails from "../ui/ProductDetails";
import { useConnection } from "wagmi";
import toast from "react-hot-toast";
import useCreateTransaction from "../../contracts/hooks/useCreateTransaction";
import { eventBus } from "../../lib/eventBus";

/* --------------------------- Component --------------------------- */

export default function DisplayProducts({ query }: { query: string | null }) {
  const { address } = useConnection();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [createTransactionSeccessful, setCreateTransactionSeccessful] =
    useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const { approveAndBuy, isPending } = useCreateTransaction();

  function fetchProducts() {
    axios
      .get("/get-products", {
        params: {
          active: true,
          search: query ?? undefined,
          page: pagination.page,
        },
      })
      .then((res) => {
        setProducts(res.data.products);
        setPagination((p: PaginationMeta) => ({
          ...p,
          page: res.data.meta.page,
          totalPages: res.data.meta.totalPages,
          total: res.data.meta.total,
        }));
      })
      .catch((err) => console.error("Error fetching products:", err));
  }

  /* ------------------------- Fetch Products ------------------------ */

  useEffect(() => {
    fetchProducts();
  }, [query, pagination.page]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [query]);

  useEffect(() => {
    if (disableSubmit === false) return;

    if (createTransactionSeccessful) {
      toast.success("Purchase successful", { id: "buy-product" });
    } else {
      toast.error("Blockchain transaction failed", {
        id: "buy-product",
      });
    }
    setDisableSubmit(false);
    setSelectedProduct(null);
    setCreateTransactionSeccessful(false);
  }, [createTransactionSeccessful]);

  useEffect(() => {
    console.log(document.body.scrollHeight);
  }, [document.body.scrollHeight]);
  /* --------------------------- Buy Flow --------------------------- */

  const buyProduct = async (
    product: Product,
    quantity: number,
    buyerEmail: string,
    price: number
  ) => {
    if (address === product.seller) {
      toast("You can't buy your own product");
      return;
    }

    try {
      setDisableSubmit(true);

      toast.loading("Processing transaction…", { id: "buy-product" });

      const res = await axios.post("/create-transaction", {
        productId: product._id,
        price: product.price,
        quantity,
        seller: product.seller,
        buyer: address,
        buyerEmail,
      });

      localStorage.setItem("user-email", buyerEmail);

      const { detailsCid } = res.data.transaction;

      try {
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
      } catch (_) {
        setCreateTransactionSeccessful(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Transaction failed", {
        id: "buy-product",
      });
    }
  };

  /* ----------------------- Persist Email -------------------------- */

  useEffect(() => {
    setUserEmail(localStorage.getItem("user-email") ?? "");
  }, []);

  useEffect(() => {
    eventBus.on("FETCH_PRODUCTS", fetchProducts);

    return () => {
      eventBus.on("FETCH_PRODUCTS", fetchProducts);
    };
  }, []);

  /* ----------------------------- UI ------------------------------ */

  return (
    <div className="relative">
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product._id}
              className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 hover:shadow-xl transition cursor-pointer"
            >
              {/* Image */}
              <div
                className="relative h-48 overflow-hidden"
                onClick={() => setSelectedProduct(product)}
              >
                <img
                  src={`https://ipfs.io/ipfs/${product.imageCid}`}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition"
                />
              </div>

              {/* Content */}
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
            className="px-4 py-2 text-xs rounded-lg border border-neutral-700
        disabled:opacity-40"
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
            className="px-4 py-2 text-xs rounded-lg border border-neutral-700
        disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Product Modal */}
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
