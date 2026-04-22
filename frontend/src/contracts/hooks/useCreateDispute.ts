import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MarketplaceContractConfig } from "../marketPlace";

export default function useCreateDispute() {
  const {
    data: hash,
    error,
    isPending,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createDispute = async (id: string) => {
    const txHash = await writeContractAsync({
      ...MarketplaceContractConfig,
      functionName: "openDispute",
      args: [BigInt(id)],
    });

    return txHash;
  };

  return {
    createDispute,
    isPending,
    isLoading,
    isSuccess,
    hash,
    error,
  };
}
