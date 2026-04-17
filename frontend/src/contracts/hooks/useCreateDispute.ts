import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MarketplaceContractConfig } from "../marketPlace";

export default function createDispute() {
  const {
    data: hash,
    error,
    isPending,
    mutateAsync: writeContractAsync,
  } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createDispute = async (id: string) => {
    await writeContractAsync({
      ...MarketplaceContractConfig,
      functionName: "openDispute",
      args: [BigInt(id)],
    });
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
