import axios from "axios";
import { X } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import useCreateReview from "../../contracts/hooks/useCreateReview";
import useReadBalance from "../../contracts/hooks/useReadBalance";
import resolveProductImage from "../../utils/resolveProductImage";

export default function ProductDetails({
  disableSubmit,
  product,
  setSelectedProduct,
  buyProduct,
  defaultEmail,
}: {
  disableSubmit: boolean;
  product: Product;
  setSelectedProduct: Dispatch<SetStateAction<Product | null>>;
  buyProduct: (
    product: Product,
    quantity: number,
    buyerEmail: string,
    price: number
  ) => void;
  defaultEmail: string;
}) {
  const { address } = useAccount();
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState(defaultEmail);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showReviews, setShowReviews] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const { createReview } = useCreateReview();

  const totalPrice = quantity * Number(product.price);

  const submitRating = async (product: Product) => {
    if (!rating || !address) return;

    try {
      setSubmittingRating(true);
      toast.loading("Submitting rating...", { id: "rating" });

      await createReview(product.productId, rating, review);
      await axios.put(`/rate-product/${product._id}`, {
        rating,
        comment: review,
        reviewer: address,
      });

      toast.success("Rating submitted!", { id: "rating" });
      setRating(0);
      setReview("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit rating", { id: "rating" });
    } finally {
      setSubmittingRating(false);
    }
  };

  const { formatedBalance } = useReadBalance();

  const sufficientBalance = useMemo(
    () => totalPrice <= Number(formatedBalance),
    [totalPrice, formatedBalance]
  );

  const purchaseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    purchaseRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [quantity, email]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl bg-neutral-950 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-950 z-10">
          <h2 className="text-lg font-semibold text-white">{product.name}</h2>
          <X
            onClick={() => setSelectedProduct(null)}
            className="cursor-pointer text-gray-400 hover:text-red-500"
          />
        </div>

        <div className="flex flex-col md:flex-row overflow-auto">
          <div className="flex-1 p-6 md:max-h-[80vh] space-y-4">
            <img
              src={resolveProductImage(product)}
              alt={product.name}
              className="w-full h-72 object-cover rounded-xl"
            />

            <p className="text-sm text-neutral-400">{product.description}</p>

            <div
              className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer"
              onClick={() => setShowReviews((prev) => !prev)}
            >
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>
                    {i < Math.round(product.averageRating ?? 0) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <span>
                {product.averageRating?.toFixed(1) ?? "0.0"} (
                {product.ratingCount ?? 0} reviews)
              </span>
            </div>

            {showReviews && (
              <div className="mt-2 border-t border-neutral-800 pt-2 space-y-3 max-h-64 overflow-y-auto">
                {product.reviews.length === 0 ? (
                  <p className="text-neutral-500 text-sm">No reviews yet.</p>
                ) : (
                  product.reviews.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 border border-neutral-700 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white truncate">
                          {r.reviewer ?? "Anonymous"}
                        </span>
                        <span className="text-yellow-400 text-sm">
                          {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                        </span>
                      </div>
                      <p className="text-neutral-400 text-sm mt-1">
                        {r.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-neutral-400 border-t border-neutral-800 pt-4">
              <div>
                <p className="text-neutral-500">Seller Address</p>
                <p className="truncate text-neutral-200">{product.seller}</p>
              </div>
              <div>
                <p className="text-neutral-500">Contact</p>
                <p className="truncate text-neutral-200">{product.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-neutral-400 border-t border-neutral-800 pt-4">
              <div>
                <p className="text-neutral-500">Product ID</p>
                <p className="text-neutral-200">{product.productId}</p>
              </div>
              <div>
                <p className="text-neutral-500">Created</p>
                <p className="text-neutral-200">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-4 space-y-3">
              <p className="text-sm font-medium text-white">Rate this product</p>

              <div className="flex gap-1 text-2xl text-yellow-400 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={`transition ${
                      rating >= star ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="review..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-yellow-500"
              />

              <button
                onClick={() => submitRating(product)}
                disabled={!rating || submittingRating}
                className="w-fit px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 disabled:opacity-50"
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>

          <div
            ref={purchaseRef}
            className="w-full md:w-[320px] border-l border-neutral-800 p-6 space-y-4 bg-neutral-950"
          >
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Purchase Summary
              </h3>

              <div>
                <p className="text-sm text-neutral-500 mb-2">Quantity</p>
                <div className="flex items-center justify-between rounded-lg border border-neutral-700 px-4 py-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-xl text-neutral-400"
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-xl text-neutral-400"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-2">Buyer Email</p>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>Unit Price</span>
                  <span>{product.price} MNEE</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Total</span>
                  <span>{totalPrice} MNEE</span>
                </div>
              </div>

              <button
                disabled={!sufficientBalance || disableSubmit || !email}
                onClick={() => buyProduct(product, quantity, email, totalPrice)}
                className="w-full rounded-xl py-3 font-semibold transition bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50"
              >
                {disableSubmit ? "Processing..." : "Confirm Purchase"}
              </button>

              <Link
                to={`mailto:${product.email}`}
                className="block text-center w-full rounded-xl py-3 font-medium border border-neutral-700 hover:border-neutral-500 transition"
              >
                Contact Seller
              </Link>
            </div>

            <div className="rounded-2xl border border-yellow-600/30 bg-yellow-600/10 p-4 text-sm text-yellow-300">
              <p className="font-semibold mb-2">Important:</p>
              <p>
                Ensure your email address is correct and active. It will be used
                for direct communication between you and the seller.
              </p>
              <p className="mt-3">
                If the seller does not respond within 48 hours, you may open a
                dispute using this email to resolve the issue quickly or receive
                a refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}