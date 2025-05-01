"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Check, ChevronDown, Copy, ExternalLink, LogOut, Wallet } from "lucide-react";
import { useDisconnect } from "wagmi";
import { Button } from "~~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { truncateAddress } from "~~/lib/utils";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

interface CustomWalletConnectionProps {
  className?: string;
}

export function CustomWalletConnection({ className }: CustomWalletConnectionProps) {
  const [copied, setCopied] = useState(false);
  // Remove disconnecting state, use isLoading from useDisconnect instead
  // const [disconnecting, setDisconnecting] = useState(false);
  const { disconnect, isPending, isSuccess, isError, error } = useDisconnect();
  const { targetNetwork } = useTargetNetwork();

  // 处理断开连接
  const handleDisconnect = () => {
    if (isPending) return; // Prevent multiple calls while disconnecting
    disconnect();
    console.log("Disconnect initiated");
  };

  // Effect to handle successful disconnection
  useEffect(() => {
    if (isSuccess) {
      console.log("Disconnect successful");
      // 清除 localStorage 中的特定项
      if (typeof window !== "undefined") {
        const keysToRemove = [
          "niuniu-wallet-connection",
          "wagmi.connected",
          "wagmi.connectors",
          "wagmi.wallet",
          "wagmi.account",
          "wagmi.chainId",
          "rk-wallets",
        ];

        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
            console.log(`Removed ${key} from localStorage`);
          } catch (e) {
            console.error(`Failed to remove ${key}:`, e);
          }
        });

        // Reload page after successful disconnect and cleanup
        console.log("Reloading page after disconnect");
        // window.location.reload();
      }
    }
    if(isError) {
      console.log("Disconnect error:", error);
    }
  }, [isSuccess, isError]);

  // Effect to handle disconnection errors
  useEffect(() => {
    if (isError) {
      console.error("Disconnect error:", error);
      // Optionally reset any state or show an error message to the user
    }
  }, [isError, error]);

  // Copy address to clipboard
  const copyAddress = (address: string) => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted, openChainModal }) => {
        const connected = mounted && account && chain;
        // 获取区块浏览器链接
        const explorerLink = account ? getBlockExplorerAddressLink(targetNetwork, account.address) : undefined;

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              className={`bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium relative overflow-hidden group ${className}`}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full"></div>
            </Button>
          );
        }

        if (chain.unsupported || chain.id !== targetNetwork.id) {
          return (
            <Button onClick={openChainModal} className="bg-red-500 hover:bg-red-600 text-white font-medium">
              <span>Wrong Network</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/80 text-zinc-300 hover:text-white hover:border-amber-500/50 transition-all duration-200 flex items-center gap-2 pr-3 pl-2 h-9 group"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-2">
                    <Wallet className="h-3 w-3 text-black" />
                  </div>
                  <span className="text-sm font-medium">{truncateAddress(account.address)}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                <div className="absolute inset-0 -z-10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md bg-amber-500/5"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/80 p-1 shadow-lg shadow-black/40"
            >
              <div className="px-2 py-2.5 mb-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-zinc-500">Connected Wallet</div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-white truncate">{truncateAddress(account.address)}</div>
              </div>

              <DropdownMenuSeparator className="bg-zinc-800/80" />

              <DropdownMenuItem
                className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800/70"
                onClick={() => copyAddress(account.address)}
              >
                {copied ? <Check className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy Address"}
              </DropdownMenuItem>


              {chain.id !== targetNetwork.id && (
                <DropdownMenuItem
                  className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800/70"
                  onClick={openChainModal}
                >
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Switch Network
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-zinc-800/80" />

              <DropdownMenuItem
                className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-950/20"
                onClick={handleDisconnect}
                disabled={isPending} // Disable button while disconnecting
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isPending ? "Disconnecting..." : "Disconnect"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }}
    </ConnectButton.Custom>
  );
}
