import { useReadContracts } from "wagmi";
import { MNEEContractConfig } from "../mnee";

export function useTokenDetails() {
  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        ...MNEEContractConfig,
        functionName: "name",
      },
      {
        ...MNEEContractConfig,
        functionName: "symbol",
      },
      {
        ...MNEEContractConfig,
        functionName: "decimals",
      },
      {
        ...MNEEContractConfig,
        functionName: "totalSupply",
      },
    ],
  });

  return {
    name: data?.[0]?.result as string | undefined,
    symbol: data?.[1]?.result as string | undefined,
    decimals: data?.[2]?.result as number | undefined,
    totalSupply: data?.[3]?.result as number | undefined,
    isLoading,
    error,
  };
}
