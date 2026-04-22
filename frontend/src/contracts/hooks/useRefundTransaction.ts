import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MarketplaceContractConfig } from "../marketPlace";

export default function useRefundTransaction() {
  const {
    data: hash,
    error,
    isPending,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const refundTransaction = async (txnId: string) => {
    const txHash = await writeContractAsync({
      ...MarketplaceContractConfig,
      functionName: "cancelTransaction",
      args: [BigInt(txnId)],
    });

    return txHash;
  };

  return {
    refundTransaction,
    isPending,
    isLoading,
    isSuccess,
    hash,
    error,
  };
}