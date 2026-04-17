import { useState } from "react";
import { useConnection, useReadContract } from "wagmi";
import { MNEEContractConfig } from "../mnee";
import { MarketplaceContractConfig } from "../marketPlace";

interface AllowanceResponse {
  allowance: bigint;
  amount: bigint;
  sufficient: boolean;
  difference: bigint;
}

export function useAllowance() {
  const { address } = useConnection();

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    ...MNEEContractConfig,
    functionName: "allowance",
    args: [
      address ?? "0x0000000000000000000000000000000000000000",
      MarketplaceContractConfig.address,
    ],
  });

  const allowance = allowanceData ? BigInt(allowanceData) : BigInt(0);

  const [response, setResponse] = useState<AllowanceResponse>({
    allowance,
    amount: BigInt(0),
    sufficient: false,
    difference: BigInt(0),
  });

  async function checkAllowance(amount: bigint) {
    // refetch allowance from blockchain
    const newAllowanceData = await refetchAllowance();
    const currentAllowance = newAllowanceData.data
      ? BigInt(newAllowanceData.data)
      : BigInt(0);

    setResponse({
      allowance: currentAllowance,
      amount,
      sufficient: currentAllowance >= amount,
      difference:
        amount > currentAllowance ? amount - currentAllowance : BigInt(0),
    });

    return {
      allowance: currentAllowance,
      amount,
      sufficient: currentAllowance >= amount,
      difference:
        amount > currentAllowance ? amount - currentAllowance : BigInt(0),
    };
  }

  return { ...response, checkAllowance };
}
