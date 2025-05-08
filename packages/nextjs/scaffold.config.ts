import * as chains from "viem/chains";
import { Chain } from "viem/chains";
import { monadTestnet } from "./utils/customChains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export const DEFAULT_ALCHEMY_API_KEY = "I4fR79ZhTt_iXk6ml78nKT5B4HsM-s3S";

// 自定义 Hardhat 链配置，添加 multicall3 合约地址
const hardhat = {
  ...chains.hardhat,
  contracts: {
    ...chains.hardhat.contracts,
    multicall3: {
      address: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788", // 替换为您部署的 Multicall3 合约地址
    },
    BBGameMain: {
      address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // 替换为您在本地部署的 BBGameMain 合约地址
    },
  },
};

// 使用条件判断在生产环境中排除hardhat网络
// 如果是NODE_ENV为'production'，则只使用MonadNetwork，否则包含hardhat
const isDevelopment = process.env.NODE_ENV !== 'production';

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [
    ...(isDevelopment ? [hardhat] : []), // 只在开发环境中包含hardhat
    monadTestnet,
    // {
    //   ...chains.polygon,
    //   contracts: {
    //     ...chains.polygon.contracts,
    //     BBGameMain: {
    //       address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    //     },
    //   },
    // },
    // {
    //   ...chains.bsc,
    //   contracts: {
    //     ...chains.bsc.contracts,
    //     BBGameMain: {
    //       address: "",
    //     },
    //   },
    // },
    // {
    //   ...chains.arbitrum,
    //   contracts: {
    //     ...chains.arbitrum.contracts,
    //     BBGameMain: {
    //       address: "",
    //     },
    //   },
    // },
    // 您可以添加更多网络，例如：
    // {
    //   ...chains.optimism,
    //   contracts: {
    //     ...chains.optimism.contracts,
    //     BBGameMain: {
    //       address: contractAddresses[10].BBGameMain,
    //     },
    //   },
    // },
    // {
    //   ...chains.base,
    //   contracts: {
    //     ...chains.base.contracts,
    //     BBGameMain: {
    //       address: contractAddresses[8453].BBGameMain,
    //     },
    //   },
    // },
    // {
    //   ...chains.avalanche,
    //   contracts: {
    //     ...chains.avalanche.contracts,
    //     BBGameMain: {
    //       address: contractAddresses[43114].BBGameMain,
    //     },
    //   },
    // },
  ],

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

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,

} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
