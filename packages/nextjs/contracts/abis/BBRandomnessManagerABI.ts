// BBGameMain.ts
const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyCommitted",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyRevealed",
    type: "error",
  },
  {
    inputs: [],
    name: "CommitDeadlineExpired",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "ERC1967InvalidImplementation",
    type: "error",
  },
  {
    inputs: [],
    name: "ERC1967NonPayable",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedCall",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidParticipants",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidReveal",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAParticipant",
    type: "error",
  },
  {
    inputs: [],
    name: "NotCommitted",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyGameTableCanCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "RevealDeadlineExpired",
    type: "error",
  },
  {
    inputs: [],
    name: "RevealPhaseNotStarted",
    type: "error",
  },
  {
    inputs: [],
    name: "SessionAlreadyCompleted",
    type: "error",
  },
  {
    inputs: [],
    name: "SessionNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "UUPSUnauthorizedCallContext",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "slot",
        type: "bytes32",
      },
    ],
    name: "UUPSUnsupportedProxiableUUID",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "gameMainAddr",
        type: "address",
      },
    ],
    name: "GameMainAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tableAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "sessionId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "participant",
        type: "address",
      },
    ],
    name: "RandomCommitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tableAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "sessionId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "participant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "revealedValue",
        type: "uint256",
      },
    ],
    name: "RandomRevealed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tableAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "sessionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "finalSeed",
        type: "uint256",
      },
    ],
    name: "SessionCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tableAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "sessionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "commitDeadline",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "revealDeadline",
        type: "uint256",
      },
    ],
    name: "SessionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
    ],
    name: "VersionUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tableAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_sessionId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_commitment",
        type: "bytes32",
      },
    ],
    name: "commitRandom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_sessionId",
        type: "uint256",
      },
    ],
    name: "completeSession",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_participants",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "_commitTimeout",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_revealTimeout",
        type: "uint256",
      },
    ],
    name: "createSession",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "gameMainAddr",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tableAddress",
        type: "address",
      },
    ],
    name: "getCurrentSessionId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tableAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_sessionId",
        type: "uint256",
      },
    ],
    name: "getSessionStatus",
    outputs: [
      {
        internalType: "bool",
        name: "isCompleted",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "commitDeadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "revealDeadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "finalSeed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "commitCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "revealCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalParticipants",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tableAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_sessionId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_participant",
        type: "address",
      },
    ],
    name: "hasCommitted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tableAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_sessionId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_participant",
        type: "address",
      },
    ],
    name: "hasRevealed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_gameMainAddr",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proxiableUUID",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tableAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_sessionId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_randomValue",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_salt",
        type: "bytes32",
      },
    ],
    name: "revealRandom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_gameMainAddr",
        type: "address",
      },
    ],
    name: "setGameMainAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_version",
        type: "uint256",
      },
    ],
    name: "updateVersion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// 导出合约配置
export const BBRandomnessManagerABI = {
  abi,
} as const;

// 导出具体的函数 ABI，可以更细粒度地 tree-shake
export const commitRandom = abi.find(x => "name" in x && x.name === "commitRandom");
export const revealRandom = abi.find(x => "name" in x && x.name === "revealRandom");
export const getSessionStatus = abi.find(x => "name" in x && x.name === "getSessionStatus");
export const hasCommitted = abi.find(x => "name" in x && x.name === "hasCommitted");
export const hasRevealed = abi.find(x => "name" in x && x.name === "hasRevealed");
export const getCurrentSessionId = abi.find(x => "name" in x && x.name === "getCurrentSessionId");
