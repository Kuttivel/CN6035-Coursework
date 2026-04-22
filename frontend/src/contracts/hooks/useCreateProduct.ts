import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MarketplaceContractConfig } from "../marketPlace";
import { MNEEContractConfig } from "../mnee";
import { useTokenDetails } from "./useTokenDetails";
import { formatUnits } from "viem";
import { useAllowance } from "./useAllowance";
import { useTaskQueue } from "../../store/useTaskQueue";
import { Dispatch, SetStateAction } from "react";

export default function useCreateProduct() {
  const { enqueue } = useTaskQueue();

  const { data: hash, error, isPending, writeContractAsync } =
    useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { decimals = 18 } = useTokenDetails();
  const { checkAllowance } = useAllowance();

  const createProductFee = 10n * 10n ** BigInt(decimals);

  const approveAndCreate = async (
    price: string,
    metadataCID: string,
    setCreateProductSeccessful: Dispatch<SetStateAction<boolean>>
  ) => {
    const { sufficient } = await checkAllowance(createProductFee);

    const createProduct = async () => {
      try {
        await writeContractAsync({
          ...MarketplaceContractConfig,
          functionName: "createProduct",
          args: [BigInt(Number(price) * 10 ** decimals), metadataCID],
        });
        setCreateProductSeccessful(true);
      } catch {
        setCreateProductSeccessful(false);
      }
    };

    if (!sufficient) {
      await writeContractAsync({
        ...MNEEContractConfig,
        functionName: "approve",
        args: [MarketplaceContractConfig.address, createProductFee],
      });

      enqueue(createProduct);
    } else {
      await createProduct();
    }
  };

  return {
    approveAndCreate,
    createProductFee: formatUnits(createProductFee, decimals ?? 18),
    isPending,
    isLoading,
    isSuccess,
    hash,
    error,
  };
}