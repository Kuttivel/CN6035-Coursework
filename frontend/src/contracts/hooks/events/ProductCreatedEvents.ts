import { useWatchContractEvent } from "wagmi";
import { MarketplaceContractConfig } from "../../marketPlace";
import { eventBus } from "../../../lib/eventBus";

export function useWatchProductCreated() {
  useWatchContractEvent({
    ...MarketplaceContractConfig,
    eventName: "ProductCreated",
    onLogs() {
     eventBus.emit("FETCH_PRODUCTS", null);
    },
  });
}
