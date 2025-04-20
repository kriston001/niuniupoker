import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  contracts: {
    BBGameMain: string;
  };
};

export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

// 自定义 Hardhat 链配置，添加 multicall3 合约地址
const hardhatWithMulticall = {
  ...chains.hardhat,
  contracts: {
    ...chains.hardhat.contracts,
    multicall3: {
      address: "0x0165878A594ca255338adfa4d48449f69242Eb8F ", // 替换为您部署的 Multicall3 合约地址
    },
  },
};

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [hardhatWithMulticall],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // If you want to use a different RPC for a specific network, you can add it here.
  // The key is the chain ID, and the value is the HTTP RPC URL
  rpcOverrides: {
    // Example:
    // [chains.mainnet.id]: "https://mainnet.buidlguidl.com",
  },

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  contracts: {
    BBGameMain: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    // 可以添加更多合约地址
  },

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
