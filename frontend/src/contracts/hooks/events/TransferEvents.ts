import { useWatchContractEvent } from "wagmi";
import { MNEEContractConfig } from "../../mnee";
import { isAddressEqual } from "viem";

export function useWatchTokenTransfers(
  address?: `0x${string}`,
  onChange?: () => void
) {
  useWatchContractEvent({
    ...MNEEContractConfig,
    eventName: "Transfer",
    enabled: Boolean(address),
    onLogs(logs) {
      if (!address) return;

      for (const log of logs) {
        const { from, to } = log.args as {
          from: `0x${string}`;
          to: `0x${string}`;
        };


        if (
          isAddressEqual(from, address) ||
          isAddressEqual(to, address)
        ) {
          onChange?.();
          break;
        }
      }
    },
  });
}
