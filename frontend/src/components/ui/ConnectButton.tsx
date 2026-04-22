import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import { useTokenDetails } from "../../contracts/hooks/useTokenDetails";
import useReadBalance from "../../contracts/hooks/useReadBalance";
import { formatNumber } from "../../utils";

export const AccountConnectButton = ({
  readBalance,
  compact = false,
}: {
  readBalance: ReturnType<typeof useReadBalance>;
  compact?: boolean;
}) => {
  const { connector } = useAccount();
  const { symbol } = useTokenDetails();
  const { balance, formatedBalance, ethBalance } = readBalance;

  const icon = connector?.icon;

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
            className={compact ? "w-full" : "flex justify-center"}
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
                className={`bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  compact ? "w-full" : ""
                }`}
                type="button"
              >
                Connect Wallet
              </button>
            )}

            {connected && chain?.unsupported && (
              <button
                onClick={openChainModal}
                className={`bg-red-600/20 border border-red-600/40 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold ${
                  compact ? "w-full" : ""
                }`}
                type="button"
              >
                Wrong Network
              </button>
            )}

            {connected && !chain?.unsupported && compact && (
              <button
                onClick={openAccountModal}
                className="w-full flex items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 px-4 py-3 rounded-lg transition text-sm"
                type="button"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {account.ensAvatar ? (
                    <img
                      src={account.ensAvatar}
                      alt="avatar"
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-700 shrink-0">
                      {icon && (
                        <img
                          src={icon}
                          alt="wallet"
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  )}

                  <div className="min-w-0 text-left">
                    <p className="truncate font-medium">{account.displayName}</p>
                    <p className="text-xs text-neutral-400 truncate">
                      {displayBalance}
                    </p>
                  </div>
                </div>

                <ChevronDown size={16} className="shrink-0" />
              </button>
            )}

            {connected && !chain?.unsupported && !compact && (
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={openChainModal}
                  className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 px-3 py-2 rounded-lg transition"
                  type="button"
                >
                  {chain.hasIcon && (
                    <div
                      className="w-5 h-5 rounded-full overflow-hidden"
                      style={{ background: chain.iconBackground }}
                    >
                      {chain.iconUrl && (
                        <img
                          src={chain.iconUrl}
                          alt={chain.name}
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  )}
                  <span className="hidden sm:inline">{chain.name}</span>
                  <ChevronDown size={14} />
                </button>

                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 px-3 py-2 rounded-lg transition"
                  type="button"
                >
                  <span className="text-neutral-300 whitespace-nowrap">
                    {displayBalance}
                  </span>

                  <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1 rounded-lg">
                    {account.ensAvatar ? (
                      <img
                        src={account.ensAvatar}
                        alt="avatar"
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-neutral-700">
                        {icon && (
                          <img
                            src={icon}
                            alt="wallet"
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    )}

                    <span className="max-w-20 truncate">
                      {account.displayName}
                    </span>
                    <ChevronDown size={14} />
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