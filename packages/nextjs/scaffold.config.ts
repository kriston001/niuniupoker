import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

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

const MonadNetwork = {
  id: 10143, // 链ID
  name: "Monad Testnet",
  network: "custom",
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
      address: "0xcA11bde05977b3631167028862bE2a173976CA11", // 替换为您在自定义网络上部署的 Multicall3 合约地址
    },
    BBGameMain: {
      address: "", // 替换为您在 Monad Testnet 上部署的 BBGameMain 合约地址
    },
  },
};

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [
    hardhat,
    MonadNetwork,
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
