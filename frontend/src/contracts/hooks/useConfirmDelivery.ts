import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MarketplaceContractConfig } from "../marketPlace";

export default function useConfirmDelivery() {
  const { data: hash, error, isPending, writeContractAsync } =
    useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const confirmDelivery = async (txnId: string) => {
    const txHash = await writeContractAsync({
      ...MarketplaceContractConfig,
      functionName: "confirmDelivery",
      args: [BigInt(txnId)],
    });

    return txHash;
  };

  return {
    confirmDelivery,
    isPending,
    isLoading,
    isSuccess,
    hash,
    error,
  };
}