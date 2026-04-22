import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useTokenDetails } from "../../contracts/hooks/useTokenDetails";
import useReadBalance from "../../contracts/hooks/useReadBalance";
import { formatNumber } from "../../utils";

export const AccountConnectButton = ({
  readBalance,
}: {
  readBalance: ReturnType<typeof useReadBalance>;
}) => {
  const { connector } = useAccount();
  const { symbol } = useTokenDetails();
  const { balance, formatedBalance, ethBalance } = readBalance;

  const icon = connector?.icon;
  const rkDetails = connector?.rkDetails as IconConfig | undefined;

  const displayBalance =
    balance !== undefined
      ? `${formatNumber(formatedBalance)} ${symbol}`
      : `${formatNumber(
          formatUnits(ethBalance?.value ?? 0n, ethBalance?.decimals ?? 18)
        )} ${ethBalance?.symbol ?? "ETH"}`;

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            className="flex justify-center"
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {!connected && (
              <button
                onClick={openConnectModal}
                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-semibold transition"
                type="button"
              >
                Connect Wallet
              </button>
            )}

            {connected && chain.unsupported && (
              <button
                onClick={openChainModal}
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold transition"
                type="button"
              >
                Wrong network
              </button>
            )}

            {connected && !chain.unsupported && (
              <div className="flex items-center gap-2">
                <button
                  onClick={openChainModal}
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
                >
                  {icon ? (
                    <img
                      src={icon}
                      alt={chain.name ?? "Wallet"}
                      className="h-4 w-4 rounded-full"
                    />
                  ) : null}
                  <span>{chain.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <button
                  onClick={openAccountModal}
                  type="button"
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{account.displayName}</span>
                    <span className="text-xs text-neutral-400">
                      {displayBalance}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};