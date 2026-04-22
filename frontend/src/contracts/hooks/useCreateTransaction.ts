import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MarketplaceContractConfig } from "../marketPlace";
import { MNEEContractConfig } from "../mnee";
import { useTokenDetails } from "./useTokenDetails";
import { parseUnits } from "viem";
import { useAllowance } from "./useAllowance";
import { useTaskQueue } from "../../store/useTaskQueue";
import { Dispatch, SetStateAction } from "react";

export default function useCreateTransaction() {
  const { enqueue } = useTaskQueue();

  const { data: hash, error, isPending, writeContractAsync } =
    useWriteContract();

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
    const allowanceAmount = parseUnits(price, decimals);
    const { sufficient } = await checkAllowance(allowanceAmount);

    const createTransaction = async () => {
      try {
        await writeContractAsync({
          ...MarketplaceContractConfig,
          functionName: "buyProduct",
          args: [productId, quantity, metadataCID],
        });
        setCreateTransactionSeccessful(true);
      } catch {
        setCreateTransactionSeccessful(false);
      }
    };

    if (!sufficient) {
      await writeContractAsync({
        ...MNEEContractConfig,
        functionName: "approve",
        args: [MarketplaceContractConfig.address, allowanceAmount],
      });

      enqueue(createTransaction);
    } else {
      await createTransaction();
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