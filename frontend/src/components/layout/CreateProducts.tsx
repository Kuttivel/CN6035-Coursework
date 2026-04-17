import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import useCreateProduct from "../../contracts/hooks/useCreateProduct";
import useReadBalance from "../../contracts/hooks/useReadBalance";
import { useConnection } from "wagmi";

export default function CreateProduct({
  setOpenListingForm,
  readBalance,
}: {
  setOpenListingForm: Dispatch<SetStateAction<boolean>>;
  readBalance: ReturnType<typeof useReadBalance>;
}) {
  const { address } = useConnection();

  const [userEmail, setUserEmail] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createProductSeccessful, setCreateProductSeccessful] = useState(false);

  const { approveAndCreate, createProductFee, isPending } = useCreateProduct();
  const { formatedBalance } = readBalance;

  const sufficientBalance = useMemo(
    () => Number(createProductFee) <= Number(formatedBalance),
    [createProductFee, formatedBalance]
  );

  useEffect(() => {
    setUserEmail(localStorage.getItem("user-email") ?? "");
  }, []);

  useEffect(() => {
    if (submitting === false) return;

    if (createProductSeccessful) {
      toast.success("Product listed successfully!", {
        id: "create-product",
      });
    } else {
      toast.error("Blockchain Listing failed", {
        id: "create-product",
      });
    }

    setSubmitting(false);
    setOpenListingForm(false);
    setCreateProductSeccessful(false);
  }, [createProductSeccessful]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!address) return toast.error("Wallet not connected");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const price = formData.get("price")?.toString();

    try {
      setSubmitting(true);
      toast.loading("Listing product…", { id: "create-product" });

      formData.append("seller", address);

      const res = await axios.post("/create-product", formData);
      const { imageCid } = res.data.product;

      localStorage.setItem("user-email", formData.get("email") as string);

      try {
        await approveAndCreate(price!, imageCid, setCreateProductSeccessful);
      } catch (err: any) {
        setCreateProductSeccessful(false);
      }
    } catch (err: any) {
      toast.error("Listing failed", {
        id: "create-product",
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-neutral-950 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-950 z-10">
          <h2 className="text-lg font-semibold text-white">
            List New Product/Services
          </h2>
          <X
            onClick={() => setOpenListingForm(false)}
            className="cursor-pointer text-gray-400 hover:text-red-500"
          />
        </div>

        {/* Scrollable Body */}
        <form
          onSubmit={submit}
          encType="multipart/form-data"
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <input
            name="name"
            placeholder="Name"
            required
            className="w-full h-11 rounded-lg bg-neutral-950 border border-neutral-700 px-4 text-sm text-white
             focus:outline-none focus:border-emerald-500"
          />

          <input
            name="price"
            type="number"
            min="0"
            step="any"
            placeholder="Price (MNEE)"
            required
            className="w-full h-11 rounded-lg bg-neutral-950 border border-neutral-700 px-4 text-sm text-white
             focus:outline-none focus:border-emerald-500"
          />

          {/* Image Upload */}
          <label className="group flex flex-col items-center justify-center gap-2 border border-dashed border-neutral-700 rounded-xl p-4 cursor-pointer hover:border-emerald-500 transition">
            <Upload className="text-gray-400 group-hover:text-emerald-400" />
            <span className="text-sm text-gray-400">Upload image</span>
            <input
              type="file"
              name="image"
              accept="image/*"
              hidden
              required
              onChange={(e) =>
                setImagePreview(
                  e.target.files ? URL.createObjectURL(e.target.files[0]) : null
                )
              }
            />
          </label>

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="rounded-xl max-h-40 object-cover"
            />
          )}

          <input
            name="email"
            type="email"
            defaultValue={userEmail}
            placeholder="Email for notifications"
            required
            className="w-full h-11 rounded-lg bg-neutral-950 border border-neutral-700 px-4 text-sm text-white
             focus:outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2 items-start rounded-lg border border-blue-600/30 bg-blue-600/10 px-3 py-2 text-xs text-blue-300">
            <span className="mt-0.5">ℹ️</span>
            <p className="leading-relaxed">
              Ensure your email address is correct and active. It will be used
              for direct communication between you and the buyer.
            </p>
          </div>

          <textarea
            name="description"
            placeholder="Short description"
            required
            className="w-full rounded-lg bg-neutral-950 border border-neutral-700 p-4 text-sm text-white
             focus:outline-none focus:border-emerald-500 h-24 resize-none"
          />

          {/* Fee Info */}
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              sufficientBalance
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {sufficientBalance
              ? `Listing fee: ${createProductFee} MNEE`
              : `Insufficient balance — ${createProductFee} MNEE required`}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!sufficientBalance || submitting || isPending}
            className={`w-full rounded-xl py-3 font-semibold transition ${
              sufficientBalance
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "bg-red-600 text-white cursor-not-allowed"
            }`}
          >
            {submitting || isPending ? "Listing…" : "List Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
