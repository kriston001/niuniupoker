// 游戏主合约 ABI
export const gameMainAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "AddressEmptyCode",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "BetAmountTooSmall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ContractPaused",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "ERC1967InvalidImplementation",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ERC1967NonPayable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientFunds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidGameHistoryAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidInitialization",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidMaxPlayers",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MaxPlayersTooSmall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MinBetMustBePositive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoPlatformFeesToWithdraw",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotInitializing",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyTableContractCanRemoveItself",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PlatformFeePercentTooHigh",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TableDoesNotExist",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TableNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UUPSUnauthorizedCallContext",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "slot",
        "type": "bytes32"
      }
    ],
    "name": "UUPSUnsupportedProxiableUUID",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "minBet",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "maxPlayers",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "platformFeePercent",
        "type": "uint256"
      }
    ],
    "name": "GameConfigUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "gameHistoryAddress",
        "type": "address"
      }
    ],
    "name": "GameHistoryAddressSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "tableAddr",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "banker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "betAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "maxPlayers",
        "type": "uint8"
      }
    ],
    "name": "GameTableCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "tableAddr",
        "type": "address"
      }
    ],
    "name": "GameTableRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "version",
        "type": "uint64"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "Upgraded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "UPGRADE_INTERFACE_VERSION",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "addPendingPlatformFee",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "batchSize",
        "type": "uint256"
      }
    ],
    "name": "batchCleanupInactiveTables",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tableName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "betAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "tableMaxPlayers",
        "type": "uint8"
      }
    ],
    "name": "createGameTable",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gameHistoryAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "gameTables",
    "outputs": [
      {
        "internalType": "contract BBGameTable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllGameTables",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "tableAddr",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "tableName",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "bankerAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalPrizePool",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "playerCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "maxPlayers",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "creationTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "enum BBTypes.GameState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerContinuedCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerFoldCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerReadyCount",
            "type": "uint8"
          },
          {
            "internalType": "address[]",
            "name": "playerAddresses",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "currentRoundDeadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "playerTimeout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tableInactiveTimeout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastActivityTimestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct GameTableView[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllGameTablesInactive",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "tableAddr",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "tableName",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "bankerAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalPrizePool",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "playerCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "maxPlayers",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "creationTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "enum BBTypes.GameState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerContinuedCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerFoldCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerReadyCount",
            "type": "uint8"
          },
          {
            "internalType": "address[]",
            "name": "playerAddresses",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "currentRoundDeadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "playerTimeout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tableInactiveTimeout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastActivityTimestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct GameTableView[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tableAddr",
        "type": "address"
      }
    ],
    "name": "getGameTableInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "tableAddr",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "tableName",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "bankerAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalPrizePool",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "playerCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "maxPlayers",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "creationTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "enum BBTypes.GameState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerContinuedCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerFoldCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerReadyCount",
            "type": "uint8"
          },
          {
            "internalType": "address[]",
            "name": "playerAddresses",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "currentRoundDeadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "playerTimeout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tableInactiveTimeout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastActivityTimestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct GameTableView",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyGameTablesActive",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "tableAddr",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "tableName",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "bankerAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "betAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalPrizePool",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "playerCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "maxPlayers",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "creationTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "enum BBTypes.GameState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerContinuedCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerFoldCount",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "playerReadyCount",
            "type": "uint8"
          },
          {
            "internalType": "address[]",
            "name": "playerAddresses",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "currentRoundDeadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "playerTimeout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tableInactiveTimeout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastActivityTimestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct GameTableView[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVersion",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWithdrawablePlatformFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_minBet",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_maxPlayers",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_platformFeePercent",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_playerTimeout",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_tableInactiveTimeout",
        "type": "uint256"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tableAddr",
        "type": "address"
      }
    ],
    "name": "isValidGameTable",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxPlayers",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minBet",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingPlatformFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeePercent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "playerTimeout",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proxiableUUID",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tableAddr",
        "type": "address"
      }
    ],
    "name": "removeGameTable",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_gameHistoryAddress",
        "type": "address"
      }
    ],
    "name": "setGameHistoryAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tableInactiveTimeout",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_minBet",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_maxPlayers",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_platformFeePercent",
        "type": "uint256"
      }
    ],
    "name": "updateGameConfig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "upgradeToAndCall",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawPlatformFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];
