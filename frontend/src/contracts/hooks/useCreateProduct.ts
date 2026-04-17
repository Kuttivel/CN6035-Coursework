import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MarketplaceContractConfig } from "../marketPlace";
import { MNEEContractConfig } from "../mnee";
import { formatUnits, parseUnits } from "viem";
import { useTokenDetails } from "./useTokenDetails";
import { useAllowance } from "./useAllowance";
import { useTaskQueue } from "../../store/useTaskQueue";
import { Dispatch, SetStateAction } from "react";

// TODO: estimate gas price to decide if user can pay and approve transaction
export default function useCreateProduct() {
  const {
    data: hash,
    error,
    isPending,
    mutateAsync: writeContractAsync,
  } = useWriteContract();
  const { enqueue } = useTaskQueue();
  const { decimals } = useTokenDetails();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: createProductFee } = useReadContract({
    ...MarketplaceContractConfig,
    functionName: "createProductFee",
  });

  const { checkAllowance } = useAllowance();

  const approveAndCreate = async (
    price: string,
    metadataCID: string,
    setCreateProductSeccessful: Dispatch<SetStateAction<boolean>>
  ) => {
    if (!createProductFee) throw new Error("Fee not loaded");
    const { sufficient } = await checkAllowance(
      createProductFee ?? BigInt(0)
    );

    const createProduct = async () => {
      try {
        await writeContractAsync({
          ...MarketplaceContractConfig,
          functionName: "createProduct",
          args: [parseUnits(price, decimals!), metadataCID],
        });
        setCreateProductSeccessful(true);
      } catch (_) {
        setCreateProductSeccessful(false);
      }
    };

    if (!sufficient) {
      // 1️⃣ Approve MNEE
      await writeContractAsync({
        ...MNEEContractConfig,
        functionName: "approve",
        args: [MarketplaceContractConfig.address, createProductFee],
      });
      // 2️⃣ Create Product
      enqueue(createProduct);
    } else {
      createProduct();
    }
  };

  return {
    approveAndCreate,
    createProductFee: formatUnits(
      BigInt(createProductFee ?? 0),
      decimals ?? 18
    ),
    isPending,
    isLoading,
    isSuccess,
    hash,
    error,
  };
}
