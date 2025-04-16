const BBContractAbis = {
  BBGameMain: {
    address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    abi: [
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
    ],
  },
  BBGameHistory: {
    address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    abi: [
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
        name: "InvalidGameTable",
        type: "error",
      },
      {
        inputs: [],
        name: "InvalidInitialization",
        type: "error",
      },
      {
        inputs: [],
        name: "NotInitializing",
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
        name: "ReentrancyGuardReentrantCall",
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
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "gameRecordBases",
        outputs: [
          {
            internalType: "address",
            name: "tableAddr",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalPrizePool",
            type: "uint256",
          },
          {
            internalType: "enum BBTypes.CardType",
            name: "maxCardType",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "recordIndex",
            type: "uint256",
          },
        ],
        name: "getGameRecordBase",
        outputs: [
          {
            internalType: "address",
            name: "tableAddr",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "startTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalPrizePool",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "players",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "winners",
            type: "address[]",
          },
          {
            internalType: "enum BBTypes.CardType",
            name: "maxCardType",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "recordIndex",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "player",
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
        inputs: [
          {
            internalType: "address",
            name: "player",
            type: "address",
          },
        ],
        name: "getPlayerGameIndices",
        outputs: [
          {
            internalType: "uint256[]",
            name: "",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "player",
            type: "address",
          },
        ],
        name: "getPlayerGameRecords",
        outputs: [
          {
            internalType: "address[]",
            name: "tableAddrs",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "startTimes",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "endTimes",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "prizePools",
            type: "uint256[]",
          },
          {
            internalType: "bool[]",
            name: "isWinner",
            type: "bool[]",
          },
          {
            internalType: "enum BBTypes.CardType[]",
            name: "cardTypes",
            type: "uint8[]",
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
        name: "getTableGameIndices",
        outputs: [
          {
            internalType: "uint256[]",
            name: "",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalRecords",
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
        inputs: [],
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
        inputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        name: "playersData",
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
        inputs: [
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalPrizePool",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "playerAddrs",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "winnerAddrs",
            type: "address[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "playerAddr",
                type: "address",
              },
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
                name: "playerData",
                type: "tuple",
              },
            ],
            internalType: "struct BBPlayerEntry[]",
            name: "playerEntries",
            type: "tuple[]",
          },
          {
            internalType: "enum BBTypes.CardType",
            name: "maxCardType",
            type: "uint8",
          },
        ],
        name: "recordGame",
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
    ],
  },
  BBGameTable: {
    address: "",
    abi: [
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
    ],
  },
  BBRandomnessManager: {
    address: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
    abi: [
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
    ],
  },
  BBRoomCardNFT: {
    address: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    abi: [
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
        name: "ERC721EnumerableForbiddenBatchMint",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "ERC721IncorrectOwner",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "ERC721InsufficientApproval",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "approver",
            type: "address",
          },
        ],
        name: "ERC721InvalidApprover",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "operator",
            type: "address",
          },
        ],
        name: "ERC721InvalidOperator",
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
        name: "ERC721InvalidOwner",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
        ],
        name: "ERC721InvalidReceiver",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
        ],
        name: "ERC721InvalidSender",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "ERC721NonexistentToken",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
        ],
        name: "ERC721OutOfBoundsIndex",
        type: "error",
      },
      {
        inputs: [],
        name: "FailedCall",
        type: "error",
      },
      {
        inputs: [],
        name: "InvalidInitialization",
        type: "error",
      },
      {
        inputs: [],
        name: "NotInitializing",
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
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "approved",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "approved",
            type: "bool",
          },
        ],
        name: "ApprovalForAll",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "buyer",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256[]",
            name: "tokenIds",
            type: "uint256[]",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "totalPrice",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "cardTypeId",
            type: "uint256",
          },
        ],
        name: "BatchRoomCardPurchased",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "cardTypeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "active",
            type: "bool",
          },
        ],
        name: "CardTypeActiveStatusChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "cardTypeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "maxBetAmount",
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
            name: "price",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
        ],
        name: "CardTypeAdded",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "cardTypeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "maxBetAmount",
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
            name: "price",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
        ],
        name: "CardTypeUpdated",
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
            name: "owner",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "cardTypeId",
            type: "uint256",
          },
        ],
        name: "RoomCardConsumed",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "buyer",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "cardTypeId",
            type: "uint256",
          },
        ],
        name: "RoomCardPurchased",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "Transfer",
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
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "Withdrawn",
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
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "maxBetAmount",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "maxPlayers",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
        ],
        name: "addCardType",
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
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "balanceOf",
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
            internalType: "uint256",
            name: "cardTypeId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "batchBuyRoomCard",
        outputs: [
          {
            internalType: "uint256[]",
            name: "",
            type: "uint256[]",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "cardTypeId",
            type: "uint256",
          },
        ],
        name: "buyRoomCard",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "payable",
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
        name: "cardTypes",
        outputs: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "maxBetAmount",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "maxPlayers",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
          {
            internalType: "bool",
            name: "active",
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
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "consumeRoomCard",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "gameMainAddress",
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
        name: "getActiveCardTypes",
        outputs: [
          {
            internalType: "uint256[]",
            name: "",
            type: "uint256[]",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "maxBetAmount",
                type: "uint256",
              },
              {
                internalType: "uint8",
                name: "maxPlayers",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "uriSuffix",
                type: "string",
              },
              {
                internalType: "bool",
                name: "active",
                type: "bool",
              },
            ],
            internalType: "struct BBRoomCardNFT.CardType[]",
            name: "",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getAllCardTypeIds",
        outputs: [
          {
            internalType: "uint256[]",
            name: "",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "getApproved",
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
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "getCardType",
        outputs: [
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "maxBetAmount",
                type: "uint256",
              },
              {
                internalType: "uint8",
                name: "maxPlayers",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "uriSuffix",
                type: "string",
              },
              {
                internalType: "bool",
                name: "active",
                type: "bool",
              },
            ],
            internalType: "struct BBRoomCardNFT.CardType",
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
            name: "owner",
            type: "address",
          },
        ],
        name: "getRoomCardsByOwner",
        outputs: [
          {
            components: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "cardTypeId",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "maxBetAmount",
                type: "uint256",
              },
              {
                internalType: "uint8",
                name: "maxPlayers",
                type: "uint8",
              },
              {
                internalType: "string",
                name: "uriSuffix",
                type: "string",
              },
            ],
            internalType: "struct BBRoomCardNFT.CardDetails[]",
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
        name: "getUserRoomCards",
        outputs: [
          {
            internalType: "bool",
            name: "hasCard",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "cardTypeId",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "maxBetAmount",
                type: "uint256",
              },
              {
                internalType: "uint8",
                name: "maxPlayers",
                type: "uint8",
              },
              {
                internalType: "string",
                name: "uriSuffix",
                type: "string",
              },
            ],
            internalType: "struct BBRoomCardNFT.CardDetails[]",
            name: "cardDetails",
            type: "tuple[]",
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
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "hasRoomCard",
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
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "string",
            name: "baseTokenURI",
            type: "string",
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
            name: "owner",
            type: "address",
          },
          {
            internalType: "address",
            name: "operator",
            type: "address",
          },
        ],
        name: "isApprovedForAll",
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
        name: "name",
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
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "ownerOf",
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
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            internalType: "bool",
            name: "approved",
            type: "bool",
          },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "baseURI",
            type: "string",
          },
        ],
        name: "setBaseURI",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "cardTypeId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "active",
            type: "bool",
          },
        ],
        name: "setCardTypeActive",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_gameMainAddress",
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
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4",
          },
        ],
        name: "supportsInterface",
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
        name: "symbol",
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
            name: "index",
            type: "uint256",
          },
        ],
        name: "tokenByIndex",
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
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "tokenCardTypes",
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
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
        ],
        name: "tokenOfOwnerByIndex",
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
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "tokenURI",
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
        name: "totalSupply",
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
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "transferFrom",
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
            name: "cardTypeId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxBetAmount",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "maxPlayers",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
        ],
        name: "updateCardType",
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
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "betAmount",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "maxPlayers",
            type: "uint8",
          },
        ],
        name: "validateRoomCardParams",
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
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        stateMutability: "payable",
        type: "receive",
      },
    ],
  },
  BBRoomLevelNFT: {
    address: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
    abi: [
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
        name: "ERC721EnumerableForbiddenBatchMint",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "ERC721IncorrectOwner",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "ERC721InsufficientApproval",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "approver",
            type: "address",
          },
        ],
        name: "ERC721InvalidApprover",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "operator",
            type: "address",
          },
        ],
        name: "ERC721InvalidOperator",
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
        name: "ERC721InvalidOwner",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
        ],
        name: "ERC721InvalidReceiver",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
        ],
        name: "ERC721InvalidSender",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "ERC721NonexistentToken",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
        ],
        name: "ERC721OutOfBoundsIndex",
        type: "error",
      },
      {
        inputs: [],
        name: "FailedCall",
        type: "error",
      },
      {
        inputs: [],
        name: "InvalidInitialization",
        type: "error",
      },
      {
        inputs: [],
        name: "NotInitializing",
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
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "approved",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "approved",
            type: "bool",
          },
        ],
        name: "ApprovalForAll",
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
            internalType: "uint256",
            name: "levelTypeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "active",
            type: "bool",
          },
        ],
        name: "LevelTypeActiveStatusChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "levelTypeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "maxRooms",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
        ],
        name: "LevelTypeAdded",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "levelTypeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "maxRooms",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
        ],
        name: "LevelTypeUpdated",
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
            name: "buyer",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "levelTypeId",
            type: "uint256",
          },
        ],
        name: "RoomLevelPurchased",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "oldLevelTypeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "newLevelTypeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "pricePaid",
            type: "uint256",
          },
        ],
        name: "RoomLevelUpgraded",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "Transfer",
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
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "Withdrawn",
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
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "maxRooms",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
        ],
        name: "addLevelType",
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
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "balanceOf",
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
            internalType: "uint256",
            name: "levelTypeId",
            type: "uint256",
          },
        ],
        name: "buyRoomLevel",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [],
        name: "gameMainAddress",
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
        name: "getActiveLevelTypes",
        outputs: [
          {
            internalType: "uint256[]",
            name: "",
            type: "uint256[]",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "maxRooms",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "uriSuffix",
                type: "string",
              },
              {
                internalType: "bool",
                name: "active",
                type: "bool",
              },
            ],
            internalType: "struct BBRoomLevelNFT.LevelType[]",
            name: "",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getAllLevelTypeIds",
        outputs: [
          {
            internalType: "uint256[]",
            name: "",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "getApproved",
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
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "getLevelType",
        outputs: [
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "maxRooms",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "uriSuffix",
                type: "string",
              },
              {
                internalType: "bool",
                name: "active",
                type: "bool",
              },
            ],
            internalType: "struct BBRoomLevelNFT.LevelType",
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
            name: "user",
            type: "address",
          },
        ],
        name: "getMaxRooms",
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
            name: "user",
            type: "address",
          },
        ],
        name: "getUserLevelDetails",
        outputs: [
          {
            components: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "levelTypeId",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "maxRooms",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "uriSuffix",
                type: "string",
              },
            ],
            internalType: "struct BBRoomLevelNFT.LevelDetails[]",
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
        name: "getUserRoomLevel",
        outputs: [
          {
            internalType: "bool",
            name: "hasLevel",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "levelTypeId",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "maxRooms",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "uriSuffix",
                type: "string",
              },
            ],
            internalType: "struct BBRoomLevelNFT.LevelDetails[]",
            name: "levelDetails",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "totalMaxRooms",
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
            internalType: "address",
            name: "user",
            type: "address",
          },
        ],
        name: "hasRoomLevel",
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
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "string",
            name: "baseTokenURI",
            type: "string",
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
            name: "owner",
            type: "address",
          },
          {
            internalType: "address",
            name: "operator",
            type: "address",
          },
        ],
        name: "isApprovedForAll",
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
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "levelTypes",
        outputs: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "maxRooms",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
          {
            internalType: "bool",
            name: "active",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
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
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "ownerOf",
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
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            internalType: "bool",
            name: "approved",
            type: "bool",
          },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "baseURI",
            type: "string",
          },
        ],
        name: "setBaseURI",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_gameMainAddress",
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
            internalType: "uint256",
            name: "levelTypeId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "active",
            type: "bool",
          },
        ],
        name: "setLevelTypeActive",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4",
          },
        ],
        name: "supportsInterface",
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
        name: "symbol",
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
            name: "index",
            type: "uint256",
          },
        ],
        name: "tokenByIndex",
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
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "tokenLevelTypes",
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
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
        ],
        name: "tokenOfOwnerByIndex",
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
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "tokenURI",
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
        name: "totalSupply",
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
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "transferFrom",
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
            name: "levelTypeId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxRooms",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "uriSuffix",
            type: "string",
          },
        ],
        name: "updateLevelType",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "newLevelTypeId",
            type: "uint256",
          },
        ],
        name: "upgradeRoomLevel",
        outputs: [],
        stateMutability: "payable",
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
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        stateMutability: "payable",
        type: "receive",
      },
    ],
  },
} as const;

export default BBContractAbis;
