import { useWatchContractEvent } from "wagmi";
import { MNEEContractConfig } from "../../mnee";
import { useTaskQueue } from "../../../store/useTaskQueue";
import { MarketplaceContractConfig } from "../../marketPlace";

export function useWatchTokenApproval(
  address?: `0x${string}`,
) {
  const { dequeueAndRun } = useTaskQueue();

  useWatchContractEvent({
    ...MNEEContractConfig,
    eventName: "Approval",
    args: {
      owner: address,
      spender: MarketplaceContractConfig.address,
    },
    enabled: Boolean(address),
    onLogs(logs) {
      console.log("Transactions approved")
      console.log(logs);
      dequeueAndRun();
    },
  });
}
