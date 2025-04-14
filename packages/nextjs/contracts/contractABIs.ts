const BBContractAbis = {
      BBGameMain: {
        address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        "abi": [
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
      "name": "PlatformFeePercentMustBePositive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PlayerTimeoutMustBePositive",
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
      "name": "TableInactiveTimeoutMustBePositive",
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
  ],
      },
      BBGameHistory: {
        address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", 
        "abi": [
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
      "name": "FailedCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidGameTable",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
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
      "name": "ReentrancyGuardReentrantCall",
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
      "inputs": [],
      "name": "gameMainAddr",
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
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "gameRecordBases",
      "outputs": [
        {
          "internalType": "address",
          "name": "tableAddr",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPrizePool",
          "type": "uint256"
        },
        {
          "internalType": "enum BBTypes.CardType",
          "name": "maxCardType",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "recordIndex",
          "type": "uint256"
        }
      ],
      "name": "getGameRecordBase",
      "outputs": [
        {
          "internalType": "address",
          "name": "tableAddr",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPrizePool",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "players",
          "type": "address[]"
        },
        {
          "internalType": "address[]",
          "name": "winners",
          "type": "address[]"
        },
        {
          "internalType": "enum BBTypes.CardType",
          "name": "maxCardType",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "recordIndex",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getPlayerData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "playerAddr",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isBanker",
              "type": "bool"
            },
            {
              "internalType": "enum BBTypes.PlayerState",
              "name": "state",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "initialBet",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "additionalBet1",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "additionalBet2",
              "type": "uint256"
            },
            {
              "internalType": "uint8[5]",
              "name": "cards",
              "type": "uint8[5]"
            },
            {
              "internalType": "enum BBTypes.CardType",
              "name": "cardType",
              "type": "uint8"
            }
          ],
          "internalType": "struct BBPlayer",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getPlayerGameIndices",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getPlayerGameRecords",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "tableAddrs",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "startTimes",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "endTimes",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "prizePools",
          "type": "uint256[]"
        },
        {
          "internalType": "bool[]",
          "name": "isWinner",
          "type": "bool[]"
        },
        {
          "internalType": "enum BBTypes.CardType[]",
          "name": "cardTypes",
          "type": "uint8[]"
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
      "name": "getTableGameIndices",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalRecords",
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
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "playersData",
      "outputs": [
        {
          "internalType": "address",
          "name": "playerAddr",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isBanker",
          "type": "bool"
        },
        {
          "internalType": "enum BBTypes.PlayerState",
          "name": "state",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "initialBet",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "additionalBet1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "additionalBet2",
          "type": "uint256"
        },
        {
          "internalType": "enum BBTypes.CardType",
          "name": "cardType",
          "type": "uint8"
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
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPrizePool",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "playerAddrs",
          "type": "address[]"
        },
        {
          "internalType": "address[]",
          "name": "winnerAddrs",
          "type": "address[]"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "playerAddr",
              "type": "address"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "playerAddr",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "isBanker",
                  "type": "bool"
                },
                {
                  "internalType": "enum BBTypes.PlayerState",
                  "name": "state",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "initialBet",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "additionalBet1",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "additionalBet2",
                  "type": "uint256"
                },
                {
                  "internalType": "uint8[5]",
                  "name": "cards",
                  "type": "uint8[5]"
                },
                {
                  "internalType": "enum BBTypes.CardType",
                  "name": "cardType",
                  "type": "uint8"
                }
              ],
              "internalType": "struct BBPlayer",
              "name": "playerData",
              "type": "tuple"
            }
          ],
          "internalType": "struct BBPlayerEntry[]",
          "name": "playerEntries",
          "type": "tuple[]"
        },
        {
          "internalType": "enum BBTypes.CardType",
          "name": "maxCardType",
          "type": "uint8"
        }
      ],
      "name": "recordGame",
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
          "name": "_gameMainAddr",
          "type": "address"
        }
      ],
      "name": "setGameMainAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
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
    }
  ],
      },
      BBGameTable: {
        address: "", 
        "abi": [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_tableName",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "_bankerAddr",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_betAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "_maxPlayers",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "_gameMainAddr",
          "type": "address"
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
        },
        {
          "internalType": "address",
          "name": "_gameHistoryAddr",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_platformFeePercent",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ActionTimeOut",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CardLimitExceeded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FailedToGenerateUniqueCard",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GameNotEnded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GameNotInEndedState",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GameNotInPlayingState",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GameNotInWaitingState",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GameNotNextStep",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GameNotTimeToReset",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientFunds",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidMaxPlayers",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidPlayerState",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidPlayerTimeout",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidRound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidTableInactiveTimeout",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MaxPlayersReached",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotAllPlayersReady",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotBanker",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotEnoughPlayers",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyMainContractCanCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PlayerAlreadyJoined",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PlayerNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PlayerNotInReadyState",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TableNotInBetting",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TableNotInactive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferFailed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum BBTypes.CardType",
          "name": "cardType",
          "type": "uint8"
        }
      ],
      "name": "CardTypeCalculated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "count",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8[]",
          "name": "cards",
          "type": "uint8[]"
        }
      ],
      "name": "CardsDealt",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "DealerReset",
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
      "name": "GameTableChanged",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "banker",
      "outputs": [
        {
          "internalType": "address",
          "name": "playerAddr",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isBanker",
          "type": "bool"
        },
        {
          "internalType": "enum BBTypes.PlayerState",
          "name": "state",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "initialBet",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "additionalBet1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "additionalBet2",
          "type": "uint256"
        },
        {
          "internalType": "enum BBTypes.CardType",
          "name": "cardType",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bankerAddr",
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
      "name": "bankerDisband",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "playerAddr",
          "type": "address"
        }
      ],
      "name": "bankerRemovePlayer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "betAmount",
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
      "name": "checkCanNext",
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
      "name": "creationTimestamp",
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
      "name": "currentRoundDeadline",
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
      "name": "gameHistoryAddr",
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
      "name": "gameMainAddr",
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
      "name": "getAllPlayerCards",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "playerAddr",
              "type": "address"
            },
            {
              "internalType": "uint8[5]",
              "name": "cards",
              "type": "uint8[5]"
            },
            {
              "internalType": "enum BBTypes.CardType",
              "name": "cardType",
              "type": "uint8"
            }
          ],
          "internalType": "struct BBPlayerCardEntry[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllPlayerData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "playerAddr",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isBanker",
              "type": "bool"
            },
            {
              "internalType": "enum BBTypes.PlayerState",
              "name": "state",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "initialBet",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "additionalBet1",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "additionalBet2",
              "type": "uint256"
            },
            {
              "internalType": "uint8[5]",
              "name": "cards",
              "type": "uint8[5]"
            },
            {
              "internalType": "enum BBTypes.CardType",
              "name": "cardType",
              "type": "uint8"
            }
          ],
          "internalType": "struct BBPlayer[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPlayerAddresses",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "playerAddr",
          "type": "address"
        }
      ],
      "name": "getPlayerData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "playerAddr",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isBanker",
              "type": "bool"
            },
            {
              "internalType": "enum BBTypes.PlayerState",
              "name": "state",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "initialBet",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "additionalBet1",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "additionalBet2",
              "type": "uint256"
            },
            {
              "internalType": "uint8[5]",
              "name": "cards",
              "type": "uint8[5]"
            },
            {
              "internalType": "enum BBTypes.CardType",
              "name": "cardType",
              "type": "uint8"
            }
          ],
          "internalType": "struct BBPlayer",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTableInfo",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "playerAddr",
          "type": "address"
        }
      ],
      "name": "isPlayer",
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
      "name": "lastActivityTimestamp",
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
      "name": "liquidateInactiveTable",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
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
      "name": "nextStep",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "playerAddresses",
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
      "name": "playerContinue",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "playerContinuedCount",
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
      "name": "playerCount",
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
      "name": "playerFold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "playerFoldCount",
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
      "name": "playerJoin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "playerQuit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "playerReady",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "playerReadyCount",
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
      "name": "playerSettle",
      "outputs": [],
      "stateMutability": "payable",
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
      "name": "playerUnready",
      "outputs": [],
      "stateMutability": "payable",
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
      "name": "players",
      "outputs": [
        {
          "internalType": "address",
          "name": "playerAddr",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isBanker",
          "type": "bool"
        },
        {
          "internalType": "enum BBTypes.PlayerState",
          "name": "state",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "initialBet",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "additionalBet1",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "additionalBet2",
          "type": "uint256"
        },
        {
          "internalType": "enum BBTypes.CardType",
          "name": "cardType",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "randomRequestId",
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
      "name": "state",
      "outputs": [
        {
          "internalType": "enum BBTypes.GameState",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
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
      "inputs": [],
      "name": "tableName",
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
      "inputs": [],
      "name": "totalPrizePool",
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
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
      }
  } as const;
  
  export default BBContractAbis;