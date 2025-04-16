// BBGameMain.ts
const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ActionTimeOut",
    type: "error",
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
    name: "CardLimitExceeded",
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
    name: "FailedToGenerateUniqueCard",
    type: "error",
  },
  {
    inputs: [],
    name: "GameNotEnded",
    type: "error",
  },
  {
    inputs: [],
    name: "GameNotInEndedState",
    type: "error",
  },
  {
    inputs: [],
    name: "GameNotInPlayingState",
    type: "error",
  },
  {
    inputs: [],
    name: "GameNotInWaitingState",
    type: "error",
  },
  {
    inputs: [],
    name: "GameNotNextStep",
    type: "error",
  },
  {
    inputs: [],
    name: "GameNotTimeToReset",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientFunds",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMaxPlayers",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPlayerState",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRandomnessManagerAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRound",
    type: "error",
  },
  {
    inputs: [],
    name: "MaxPlayersReached",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAllPlayersReady",
    type: "error",
  },
  {
    inputs: [],
    name: "NotBanker",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnoughPlayers",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyMainContractCanCall",
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
    name: "PlayerAlreadyJoined",
    type: "error",
  },
  {
    inputs: [],
    name: "PlayerNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "PlayerNotInReadyState",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [],
    name: "TableNotInBetting",
    type: "error",
  },
  {
    inputs: [],
    name: "TableNotInactive",
    type: "error",
  },
  {
    inputs: [],
    name: "TransferFailed",
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
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum BBTypes.CardType",
        name: "cardType",
        type: "uint8",
      },
    ],
    name: "CardTypeCalculated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "count",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8[]",
        name: "cards",
        type: "uint8[]",
      },
    ],
    name: "CardsDealt",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "DealerReset",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tableAddr",
        type: "address",
      },
    ],
    name: "GameTableChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tableAddr",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "banker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
    ],
    name: "GameTableInitialized",
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
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
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
    inputs: [],
    name: "banker",
    outputs: [
      {
        internalType: "address",
        name: "playerAddr",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isBanker",
        type: "bool",
      },
      {
        internalType: "enum BBTypes.PlayerState",
        name: "state",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "initialBet",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "additionalBet1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "additionalBet2",
        type: "uint256",
      },
      {
        internalType: "enum BBTypes.CardType",
        name: "cardType",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bankerAddr",
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
    name: "bankerDisband",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "bankerFeePercent",
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
    inputs: [],
    name: "bankerIsPlayer",
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
        name: "playerAddr",
        type: "address",
      },
    ],
    name: "bankerRemovePlayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "betAmount",
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
        internalType: "bytes32",
        name: "commitment",
        type: "bytes32",
      },
    ],
    name: "commitRandom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "creationTimestamp",
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
    inputs: [],
    name: "currentRandomSessionId",
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
    inputs: [],
    name: "currentRoundDeadline",
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
    inputs: [],
    name: "gameHistoryAddr",
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
    inputs: [],
    name: "getAllPlayerCards",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "playerAddr",
            type: "address",
          },
          {
            internalType: "uint8[5]",
            name: "cards",
            type: "uint8[5]",
          },
          {
            internalType: "enum BBTypes.CardType",
            name: "cardType",
            type: "uint8",
          },
        ],
        internalType: "struct BBPlayerCardEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPlayerData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "playerAddr",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isBanker",
            type: "bool",
          },
          {
            internalType: "enum BBTypes.PlayerState",
            name: "state",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "initialBet",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "additionalBet1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "additionalBet2",
            type: "uint256",
          },
          {
            internalType: "uint8[5]",
            name: "cards",
            type: "uint8[5]",
          },
          {
            internalType: "enum BBTypes.CardType",
            name: "cardType",
            type: "uint8",
          },
        ],
        internalType: "struct BBPlayer[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPlayerAddresses",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "playerAddr",
        type: "address",
      },
    ],
    name: "getPlayerData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "playerAddr",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isBanker",
            type: "bool",
          },
          {
            internalType: "enum BBTypes.PlayerState",
            name: "state",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "initialBet",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "additionalBet1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "additionalBet2",
            type: "uint256",
          },
          {
            internalType: "uint8[5]",
            name: "cards",
            type: "uint8[5]",
          },
          {
            internalType: "enum BBTypes.CardType",
            name: "cardType",
            type: "uint8",
          },
        ],
        internalType: "struct BBPlayer",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTableInfo",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "tableAddr",
            type: "address",
          },
          {
            internalType: "string",
            name: "tableName",
            type: "string",
          },
          {
            internalType: "address",
            name: "bankerAddr",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "betAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalPrizePool",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "playerCount",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "maxPlayers",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "creationTimestamp",
            type: "uint256",
          },
          {
            internalType: "enum BBTypes.GameState",
            name: "state",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "playerContinuedCount",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "playerFoldCount",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "playerReadyCount",
            type: "uint8",
          },
          {
            internalType: "address[]",
            name: "playerAddresses",
            type: "address[]",
          },
          {
            internalType: "uint256",
            name: "currentRoundDeadline",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "playerTimeout",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tableInactiveTimeout",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastActivityTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "implementationVersion",
            type: "uint256",
          },
        ],
        internalType: "struct GameTableView",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVersion",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "implementationVersion",
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
        internalType: "string",
        name: "_tableName",
        type: "string",
      },
      {
        internalType: "address",
        name: "_bankerAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_betAmount",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "_maxPlayers",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "_gameMainAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_playerTimeout",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_tableInactiveTimeout",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_gameHistoryAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_bankerFeePercent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_liquidatorFeePercent",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_bankerIsPlayer",
        type: "bool",
      },
      {
        internalType: "address",
        name: "_rewardPoolAddr",
        type: "address",
      },
      {
        internalType: "address",
        name: "_randomnessManagerAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_implementationVersion",
        type: "uint256",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "playerAddr",
        type: "address",
      },
    ],
    name: "isPlayer",
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
    inputs: [],
    name: "lastActivityTimestamp",
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
    inputs: [],
    name: "liquidateInactiveTable",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidatorFeePercent",
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
    inputs: [],
    name: "maxPlayers",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextStep",
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
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "playerAddresses",
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
    name: "playerContinue",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "playerContinuedCount",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "playerCount",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "playerFold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "playerFoldCount",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "playerJoin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "playerQuit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "playerReady",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "playerReadyCount",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "playerSettle",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "playerTimeout",
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
    inputs: [],
    name: "playerUnready",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "players",
    outputs: [
      {
        internalType: "address",
        name: "playerAddr",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isBanker",
        type: "bool",
      },
      {
        internalType: "enum BBTypes.PlayerState",
        name: "state",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "initialBet",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "additionalBet1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "additionalBet2",
        type: "uint256",
      },
      {
        internalType: "enum BBTypes.CardType",
        name: "cardType",
        type: "uint8",
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
    name: "randomRequestId",
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
    inputs: [],
    name: "randomnessManagerAddr",
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
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "randomValue",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "revealRandom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardPoolAddr",
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
        name: "_randomnessManagerAddr",
        type: "address",
      },
    ],
    name: "setRandomnessManagerAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "state",
    outputs: [
      {
        internalType: "enum BBTypes.GameState",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tableInactiveTimeout",
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
    inputs: [],
    name: "tableName",
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
    inputs: [],
    name: "totalPrizePool",
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
    stateMutability: "payable",
    type: "receive",
  },
] as const;

// 导出合约配置
export const BBGameTableABI = {
  abi,
} as const;

// 导出具体的函数 ABI，可以更细粒度地 tree-shake
export const playerJoin = abi.find(x => "name" in x && x.name === "playerJoin");
export const playerReady = abi.find(x => "name" in x && x.name === "playerReady");
export const playerUnready = abi.find(x => "name" in x && x.name === "playerUnready");
export const playerQuit = abi.find(x => "name" in x && x.name === "playerQuit");
export const bankerDisband = abi.find(x => "name" in x && x.name === "bankerDisband");
export const bankerRemovePlayer = abi.find(x => "name" in x && x.name === "bankerRemovePlayer");
export const nextStep = abi.find(x => "name" in x && x.name === "nextStep");
export const playerFold = abi.find(x => "name" in x && x.name === "playerFold");
export const liquidateInactiveTable = abi.find(x => "name" in x && x.name === "liquidateInactiveTable");
export const getAllPlayerData = abi.find(x => "name" in x && x.name === "getAllPlayerData");
export const getPlayerData = abi.find(x => "name" in x && x.name === "getPlayerData");
export const getAllPlayerCards = abi.find(x => "name" in x && x.name === "getAllPlayerCards");
export const getTableInfo = abi.find(x => "name" in x && x.name === "getTableInfo");
