"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";
import { Button } from "~~/components/ui/button";
import { NetworkIcon } from "~~/components/icons/NetworkIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import { useGlobalState } from "~~/services/store/store";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

interface CustomNetworkSelectorProps {
  className?: string;
}

// 定义网络颜色映射
const NETWORK_COLORS: Record<string, string> = {
  // 主网
  mainnet: "#627eea",  // Ethereum
  polygon: "#8247e5",  // Polygon
  bsc: "#f3ba2f",      // BNB Chain
  arbitrum: "#28a0f0", // Arbitrum
  optimism: "#ff0420", // Optimism
  
  // 测试网
  sepolia: "#5f4bb6",
  goerli: "#f6c343",
  mumbai: "#92a5f0",
  
  // 本地网络
  hardhat: "#fff100",
  localhost: "#00ff8c",
};

export function CustomNetworkSelector({ className }: CustomNetworkSelectorProps) {
  const { targetNetwork } = useTargetNetwork();
  const setTargetNetwork = useGlobalState(({ setTargetNetwork }) => setTargetNetwork);
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [open, setOpen] = useState(false);
  
  // 获取配置中允许的网络
  const allowedNetworks = getTargetNetworks();
  
  // 将网络信息转换为UI友好的格式
  const networks = allowedNetworks.map(network => ({
    id: network.id,
    name: network.name,
    color: NETWORK_COLORS[network.name.toLowerCase()] || "#cccccc",
    chain: network,
  }));
  
  // 当前选中的网络
  const [selectedNetwork, setSelectedNetwork] = useState(() => {
    const current = networks.find(n => n.id === targetNetwork.id);
    return current || networks[0];
  });
  
  // 当 targetNetwork 变化时更新 selectedNetwork
  useEffect(() => {
    const current = networks.find(n => n.id === targetNetwork.id);
    if (current) {
      setSelectedNetwork(current);
    }
  }, [targetNetwork.id]);

  // 处理网络切换
  const handleNetworkChange = async (network: typeof selectedNetwork) => {
    setSelectedNetwork(network);
    
    // 更新全局状态中的目标网络
    setTargetNetwork(network.chain);
    
    // 如果钱包已连接且当前链不是目标链，则切换链
    if (chain && chain.id !== network.id && switchChain) {
      try {
        await switchChain({ chainId: network.id });
      } catch (error) {
        console.error("Failed to switch chain:", error);
      }
    }
    
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:text-white hover:border-amber-500/50 hover:bg-zinc-800/80 transition-all duration-200 flex items-center gap-2 h-9 pr-3 pl-2 ${className}`}
        >
          <NetworkIcon name={selectedNetwork.name} size={16} />
          <span className="text-sm font-medium">{selectedNetwork.name}</span>
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/80 p-1 shadow-lg shadow-black/40"
      >
        {networks.map(network => (
          <DropdownMenuItem
            key={network.id}
            className={`flex items-center justify-between px-2 py-1.5 text-sm rounded-sm cursor-pointer transition-colors ${
              selectedNetwork.id === network.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/70"
            }`}
            onClick={() => handleNetworkChange(network)}
          >
            <div className="flex items-center gap-2">
              <NetworkIcon name={network.name} size={16} />
              <span>{network.name}</span>
            </div>
            {selectedNetwork.id === network.id && <Check className="h-4 w-4 text-amber-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
