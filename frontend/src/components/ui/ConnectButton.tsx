import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown } from "lucide-react";
import { formatUnits } from "viem";
import { useConnection } from "wagmi";

import { useTokenDetails } from "../../contracts/hooks/useTokenDetails";
import useReadBalance from "../../contracts/hooks/useReadBalance";
import { formatNumber } from "../../utils";
import { useEffect, useState } from "react";

/* --------------------------- Component --------------------------- */

export const AccountConnectButton = ({
  readBalance,
}: {
  readBalance: ReturnType<typeof useReadBalance>;
}) => {
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

        const { balance, formatedBalance, ethBalance } = readBalance;
        const { symbol } = useTokenDetails();
        const { connector } = useConnection();
        const icon = connector?.icon;
        const rkDetails = connector?.rkDetails as IconConfig;

        const [iconDetails, setIconDetails] = useState<IconState>({
          iconAccent: "#000",
          iconBackground: "#fdc700",
          icon: icon ?? "",
        });

        useEffect(() => {
          if (!rkDetails?.iconUrl) {
            setIconDetails((state) => ({
              ...state,
              icon: icon ?? "",
            }));
            return;
          }

          rkDetails.iconUrl().then((resolvedIcon) => {
            console.log(resolvedIcon);
            setIconDetails((state) => ({
              ...state,
              iconAccent: rkDetails.iconAccent,
              iconBackground: rkDetails.iconBackground,
              icon: resolvedIcon,
            }));
          });
        }, [rkDetails, icon]);

        const displayBalance =
          balance !== undefined
            ? `${formatNumber(formatedBalance)} ${symbol}`
            : `${formatNumber(
                formatUnits(ethBalance?.value ?? 0n, ethBalance?.decimals ?? 18)
              )} ${ethBalance?.symbol ?? "ETH"}`;

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
            {/* Not connected */}
            {!connected && (
              <button
                onClick={openConnectModal}
                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Connect Wallet
              </button>
            )}

            {/* Wrong network */}
            {connected && chain?.unsupported && (
              <button
                onClick={openChainModal}
                className="bg-red-600/20 border border-red-600/40 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Wrong Network
              </button>
            )}

            {/* Connected */}
            {connected && !chain?.unsupported && (
              <div className="flex items-center gap-2 text-sm">
                {/* Chain */}
                <button
                  onClick={openChainModal}
                  className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 px-3 py-2 rounded-lg transition"
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

                {/* Account */}
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 px-3 py-2 rounded-lg transition"
                >
                  {/* Balance */}
                  <span className="text-neutral-300 whitespace-nowrap">
                    {displayBalance}
                  </span>

                  {/* Avatar */}
                  <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1 rounded-lg">
                    {account.ensAvatar ? (
                      <img
                        src={account.ensAvatar}
                        alt="avatar"
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div
                        className="w-5 h-5 rounded-full overflow-hidden"
                        style={{
                          backgroundColor: iconDetails.iconBackground
                        }}
                      >
                        {iconDetails.icon && (
                          <img
                            src={iconDetails.icon}
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
