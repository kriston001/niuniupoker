import { defineChain } from "viem";

// Base chain
export const monadTestnet = defineChain({
    id: 10143, // 链ID
    name: "Monad Testnet",
    // network: "custom",
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
        address: "0x57beFAAeA57Df35E54fFBc4076d62672c66B3ca9", // 替换为您在 Monad Testnet 上部署的 BBGameMain 合约地址
        },
    },
});