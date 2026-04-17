import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MarketplaceContractConfig } from "../marketPlace";
import { MNEEContractConfig } from "../mnee";
import { useTokenDetails } from "./useTokenDetails";
import { parseUnits } from "viem";
import { useAllowance } from "./useAllowance";
import { useTaskQueue } from "../../store/useTaskQueue";
import { Dispatch, SetStateAction } from "react";

// TODO: estimate gas price to decide if user can pay and approve transaction
export default function useCreateTransaction() {
  const { enqueue } = useTaskQueue();

  const {
    data: hash,
    error,
    isPending,
    mutateAsync: writeContractAsync,
  } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { decimals = 18 } = useTokenDetails();

  const { checkAllowance } = useAllowance();

  const approveAndBuy = async (
    productId: bigint,
    quantity: number,
    metadataCID: string,
    price: string,
    setCreateTransactionSeccessful: Dispatch<SetStateAction<boolean>>
  ) => {
    const { sufficient } = await checkAllowance(
      parseUnits(price, decimals)
    );

    const createTransaction = async () => {
      try {
        await writeContractAsync({
          ...MarketplaceContractConfig,
          functionName: "buyProduct",
          args: [productId, quantity, metadataCID],
        });
        setCreateTransactionSeccessful(true);
      } catch (_) {
        setCreateTransactionSeccessful(false);
      }
    };

    if (!sufficient) {
      // 1️⃣ Approve MNEE
      await writeContractAsync({
        ...MNEEContractConfig,
        functionName: "approve",
        args: [MarketplaceContractConfig.address, parseUnits(price, decimals)],
      });
      // 2️⃣ Create Transaction
      enqueue(createTransaction);
    } else {
      createTransaction();
    }
  };

  return {
    approveAndBuy,
    isPending,
    isLoading,
    isSuccess,
    hash,
    error,
  };
}
