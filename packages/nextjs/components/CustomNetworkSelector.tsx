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
import { toast } from "~~/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~~/components/ui/dialog";

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
  const { switchChain, error: switchError } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const [showAddNetworkDialog, setShowAddNetworkDialog] = useState(false);
  const [networkToAdd, setNetworkToAdd] = useState<any>(null);
  
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

  // 监听切换链的错误
  useEffect(() => {
    if (switchError) {
      // 检查是否是因为钱包中没有该网络
      if (
        switchError.message?.includes("Unrecognized chain ID") ||
        switchError.message?.includes("wallet_addEthereumChain") ||
        switchError.message?.includes("Chain not configured") ||
        switchError.message?.includes("Unknown chain")
      ) {
        // 找到用户尝试切换的网络
        const network = networks.find(n => n.id === networkToAdd?.id);
        if (network) {
          setShowAddNetworkDialog(true);
        }
      } else {
        toast({
          title: "网络切换失败",
          description: switchError.message,
          variant: "destructive",
        });
      }
    }
  }, [switchError, networks, networkToAdd]);

  // 处理网络切换
  const handleNetworkChange = async (network: typeof selectedNetwork) => {
    setSelectedNetwork(network);
    setNetworkToAdd(network);
    
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

  // 添加网络到钱包
  const addNetworkToWallet = async () => {
    if (!networkToAdd) return;

    if (typeof window == 'undefined') return;

    try {
      // 使用window.ethereum API添加网络
      if (window.ethereum) {
        const params = {
          chainId: `0x${networkToAdd.id.toString(16)}`, // 转换为十六进制字符串
          chainName: networkToAdd.name,
          nativeCurrency: {
            name: networkToAdd.chain.nativeCurrency.name,
            symbol: networkToAdd.chain.nativeCurrency.symbol,
            decimals: networkToAdd.chain.nativeCurrency.decimals,
          },
          rpcUrls: [networkToAdd.chain.rpcUrls.default.http[0]],
          blockExplorerUrls: networkToAdd.chain.blockExplorers?.default 
            ? [networkToAdd.chain.blockExplorers.default.url] 
            : undefined,
        };

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [params],
        });

        toast({
          title: "网络添加成功",
          description: `已成功添加 ${networkToAdd.name} 网络到您的钱包`,
        });
      } else {
        toast({
          title: "无法添加网络",
          description: "您的钱包不支持添加网络功能",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "添加网络失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setShowAddNetworkDialog(false);
    }
  };

  return (
    <>
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

      {/* 添加网络对话框 */}
      <Dialog open={showAddNetworkDialog} onOpenChange={setShowAddNetworkDialog}>
        <DialogContent className="bg-zinc-900 border border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle>Add network to your wallet</DialogTitle>
            <DialogDescription className="text-zinc-400">
              No {networkToAdd?.name} network，add？
            </DialogDescription>
          </DialogHeader>
          
          {networkToAdd && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <NetworkIcon name={networkToAdd.name} size={20} />
                <span className="font-medium">{networkToAdd.name}</span>
              </div>
              
              <div className="space-y-2 text-sm text-zinc-300">
                <p><span className="text-zinc-500">Chain ID:</span> {networkToAdd.id}</p>
                {networkToAdd.chain.nativeCurrency && (
                  <p>
                    <span className="text-zinc-500">Token:</span> {networkToAdd.chain.nativeCurrency.name} ({networkToAdd.chain.nativeCurrency.symbol})
                  </p>
                )}
                {networkToAdd.chain.rpcUrls?.default?.http?.[0] && (
                  <p><span className="text-zinc-500">RPC URL:</span> {networkToAdd.chain.rpcUrls.default.http[0]}</p>
                )}
                {networkToAdd.chain.blockExplorers?.default?.url && (
                  <p><span className="text-zinc-500">Blockchain Explorer:</span> {networkToAdd.chain.blockExplorers.default.url}</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAddNetworkDialog(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={addNetworkToWallet}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
