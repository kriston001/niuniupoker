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
    name: "BankerFeePercentMustBePositive",
    type: "error",
  },
  {
    inputs: [],
    name: "BetAmountTooSmall",
    type: "error",
  },
  {
    inputs: [],
    name: "ContractPaused",
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
    name: "EnforcedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "ExpectedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedCall",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientFunds",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidBankerFeePercent",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidGameHistoryAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidGameTableFactoryAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidLiquidatorFeePercent",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMaxPlayers",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRewardPoolAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRoomCardContract",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRoomCardParams",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRoomLevelAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "MaxPlayersTooSmall",
    type: "error",
  },
  {
    inputs: [],
    name: "MinBetMustBePositive",
    type: "error",
  },
  {
    inputs: [],
    name: "NoRoomCardOwned",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyTableContractCanRemoveItself",
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
    name: "PlayerTimeoutMustBePositive",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [],
    name: "RoomCardConsumptionFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "RoomLevelLimitExceeded",
    type: "error",
  },
  {
    inputs: [],
    name: "RoomLevelRequired",
    type: "error",
  },
  {
    inputs: [],
    name: "TableDoesNotExist",
    type: "error",
  },
  {
    inputs: [],
    name: "TableInactiveTimeoutMustBePositive",
    type: "error",
  },
  {
    inputs: [],
    name: "TableNotFound",
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
        indexed: false,
        internalType: "uint256",
        name: "minBet",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "maxPlayers",
        type: "uint8",
      },
    ],
    name: "GameConfigUpdated",
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
        name: "betAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "maxPlayers",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "roomCardTokenId",
        type: "uint256",
      },
    ],
    name: "GameTableCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "gameTableFactoryAddress",
        type: "address",
      },
    ],
    name: "GameTableFactoryAddressUpdated",
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
      {
        indexed: false,
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
    ],
    name: "GameTableImplementationUpgraded",
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
    name: "GameTableRemoved",
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
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "randomnessManagerAddress",
        type: "address",
      },
    ],
    name: "RandomnessManagerAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "rewardPoolAddress",
        type: "address",
      },
    ],
    name: "RewardPoolAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "roomCardAddress",
        type: "address",
      },
    ],
    name: "RoomCardAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "enabled",
        type: "bool",
      },
    ],
    name: "RoomCardEnabledUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "roomLevelAddress",
        type: "address",
      },
    ],
    name: "RoomLevelAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "enabled",
        type: "bool",
      },
    ],
    name: "RoomLevelEnabledUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
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
    inputs: [
      {
        internalType: "uint256",
        name: "batchSize",
        type: "uint256",
      },
    ],
    name: "batchCleanupInactiveTables",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "tableName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "betAmount",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "tableMaxPlayers",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "bankerFeePercent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "roomCardTokenId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "bankerIsPlayer",
        type: "bool",
      },
    ],
    name: "createGameTable",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "gameHistoryAddress",
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
    name: "gameTableFactoryAddress",
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
        name: "",
        type: "address",
      },
    ],
    name: "gameTables",
    outputs: [
      {
        internalType: "contract BBGameTableImplementation",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllGameTables",
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
        internalType: "struct GameTableView[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllGameTablesInactive",
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
        internalType: "struct GameTableView[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGameConfig",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "minBet",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "maxPlayers",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "maxBankerFeePercent",
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
            name: "liquidatorFeePercent",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "roomCardEnabled",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "roomLevelEnabled",
            type: "bool",
          },
          {
            internalType: "address",
            name: "gameHistoryAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "rewardPoolAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "randomnessManagerAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "roomCardAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "roomLevelAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "gameTableFactoryAddress",
            type: "address",
          },
        ],
        internalType: "struct GameConfig",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tableAddr",
        type: "address",
      },
    ],
    name: "getGameTableInfo",
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
    name: "getMyGameTablesActive",
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
        internalType: "struct GameTableView[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "getUserCreatedRoomsCount",
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
    inputs: [
      {
        internalType: "uint256",
        name: "_minBet",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "_maxPlayers",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "_maxRoomCount",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_maxBankerFeePercent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_liquidatorFeePercent",
        type: "uint256",
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
        name: "_gameTableFactoryAddress",
        type: "address",
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
        name: "tableAddr",
        type: "address",
      },
    ],
    name: "isValidGameTable",
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
    name: "maxBankerFeePercent",
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
    name: "maxRoomCount",
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
    name: "minBet",
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
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
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
    name: "randomnessManagerAddress",
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
    name: "recalculateAllUserRoomCounts",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tableAddr",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "removeType",
        type: "uint8",
      },
    ],
    name: "removeGameTable",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tableAddr",
        type: "address",
      },
    ],
    name: "removeTableRewardPool",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "rewardPoolAddress",
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
    name: "roomCardAddress",
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
    name: "roomCardEnabled",
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
    name: "roomLevelAddress",
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
    name: "roomLevelEnabled",
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
        name: "_gameHistoryAddress",
        type: "address",
      },
    ],
    name: "setGameHistoryAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_gameTableFactoryAddress",
        type: "address",
      },
    ],
    name: "setGameTableFactoryAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_randomnessManagerAddress",
        type: "address",
      },
    ],
    name: "setRandomnessManagerAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_rewardPoolAddress",
        type: "address",
      },
    ],
    name: "setRewardPoolAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_roomCardAddress",
        type: "address",
      },
    ],
    name: "setRoomCardAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_enabled",
        type: "bool",
      },
    ],
    name: "setRoomCardEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_roomLevelAddress",
        type: "address",
      },
    ],
    name: "setRoomLevelAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_enabled",
        type: "bool",
      },
    ],
    name: "setRoomLevelEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tableAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "poolId",
        type: "uint256",
      },
    ],
    name: "setTableRewardPool",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_minBet",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "_maxPlayers",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_maxBankerFeePercent",
        type: "uint256",
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
        internalType: "uint256",
        name: "_liquidatorFeePercent",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_roomCardEnabled",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "_roomLevelEnabled",
        type: "bool",
      },
    ],
    name: "updateGameConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_implementation",
        type: "address",
      },
    ],
    name: "upgradeGameTableImplementation",
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
export const BBGameMainABI = {
  abi,
} as const;

// 导出具体的函数 ABI，可以更细粒度地 tree-shake
export const getGameConfig = abi.find(x => "name" in x && x.name === "getGameConfig");
export const createGameTable = abi.find(x => "name" in x && x.name === "createGameTable");
export const batchCleanupInactiveTables = abi.find(x => "name" in x && x.name === "batchCleanupInactiveTables");
export const getAllGameTables = abi.find(x => "name" in x && x.name === "getAllGameTables");
export const getAllGameTablesInactive = abi.find(x => "name" in x && x.name === "getAllGameTablesInactive");
export const getGameTableInfo = abi.find(x => "name" in x && x.name === "getGameTableInfo");
export const getMyGameTablesActive = abi.find(x => "name" in x && x.name === "getMyGameTablesActive");
export const GameTableCreated = abi.find(x => "name" in x && x.name === "GameTableCreated");
export const GameTableRemoved = abi.find(x => "name" in x && x.name === "GameTableRemoved");
