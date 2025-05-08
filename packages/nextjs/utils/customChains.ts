import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143, // 链ID
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz/"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet",
      url: "https://testnet.monadexplorer.com/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
    BBGameMain: {
      address: "0x57beFAAeA57Df35E54fFBc4076d62672c66B3ca9", // 替换为您在网络上部署的 BBGameMain 合约地址
    },
  },
});

export const riseTestnet = defineChain({
  id: 11155931, // Chain ID
  name: "RISE Testnet",
  network: "rise-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://testnet.riselabs.xyz"] },
    default: { http: ["https://testnet.riselabs.xyz"] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.testnet.riselabs.xyz" },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
    BBGameMain: {
      address: "0x57beFAAeA57Df35E54fFBc4076d62672c66B3ca9", // 替换为您在网络上部署的 BBGameMain 合约地址
    },
  },
});
