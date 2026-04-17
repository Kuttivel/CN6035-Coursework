import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MarketplaceContractConfig } from "../marketPlace";

export default function useCreateReview() {
  const {
    data: hash,
    error,
    isPending,
    mutateAsync: writeContractAsync,
  } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createReview = async (id: string, rating: number, review: string) => {
    await writeContractAsync({
      ...MarketplaceContractConfig,
      functionName: "submitReview",
      args: [BigInt(id), rating, review],
    });
  };

  return {
    createReview,
    isPending,
    isLoading,
    isSuccess,
    hash,
    error,
  };
}
