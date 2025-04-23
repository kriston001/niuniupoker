// BBGameMain.ts
const abi = [
  {
    "inputs": [],
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
    "name": "BankerCannotLiquidate",
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
    "name": "InvalidRandomnessManagerAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRewardPoolAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRoomCardContract",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRoomCardParams",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRound",
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
    "name": "NotPoolOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyMainContractCanCall",
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
    "name": "RoomCardConsumptionFailed",
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
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "tableAddr",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameStartTimestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameEndTimestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "playerAddrs",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "winnerAddrs",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "playerBets",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "uint8[5][]",
        "name": "playerCards",
        "type": "uint8[5][]"
      }
    ],
    "name": "CreateGameHistory",
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
        "name": "version",
        "type": "uint256"
      }
    ],
    "name": "GameTableInitialized",
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
    "inputs": [],
    "name": "active",
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
    "name": "bankerFeePercent",
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
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      }
    ],
    "name": "commitRandom",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "gameEndTimestamp",
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
    "name": "gameLiquidatedCount",
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
    "name": "gameRound",
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
    "name": "gameStartTimestamp",
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
    "name": "getAllPlayerData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "addr",
            "type": "address"
          },
          {
            "internalType": "enum PlayerState",
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
            "internalType": "enum CardType",
            "name": "cardType",
            "type": "uint8"
          },
          {
            "internalType": "uint256[10]",
            "name": "__gap",
            "type": "uint256[10]"
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
            "name": "addr",
            "type": "address"
          },
          {
            "internalType": "enum PlayerState",
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
            "internalType": "enum CardType",
            "name": "cardType",
            "type": "uint8"
          },
          {
            "internalType": "uint256[10]",
            "name": "__gap",
            "type": "uint256[10]"
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
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "gameRound",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "gameLiquidatedCount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "tableAddr",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tableId",
            "type": "uint256"
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
            "internalType": "uint8",
            "name": "bankerFeePercent",
            "type": "uint8"
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
            "internalType": "enum GameState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "liquidatorFeePercent",
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
          },
          {
            "internalType": "uint256",
            "name": "rewardPoolId",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "poolId",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "name",
                "type": "string"
              },
              {
                "internalType": "address",
                "name": "banker",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "totalAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "rewardPerGame",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "winProbability",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "remainingAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256[10]",
                "name": "__gap",
                "type": "uint256[10]"
              }
            ],
            "internalType": "struct RewardPoolInfo",
            "name": "rewardPoolInfo",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "implementationVersion",
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
    "inputs": [],
    "name": "implementationVersion",
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
        "name": "_tableId",
        "type": "uint256"
      },
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
        "internalType": "uint8",
        "name": "_bankerFeePercent",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_implementationVersion",
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
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "liquidatorFeePercent",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "players",
    "outputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      },
      {
        "internalType": "enum PlayerState",
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
        "internalType": "enum CardType",
        "name": "cardType",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "randomnessManagerAddr",
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
    "name": "removeTableRewardPool",
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
        "internalType": "uint256",
        "name": "randomValue",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "revealRandom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardPoolAddr",
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
    "name": "rewardPoolId",
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
    "name": "roomCardAddr",
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
        "name": "_randomnessManagerAddr",
        "type": "address"
      }
    ],
    "name": "setRandomnessManagerAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "poolId",
        "type": "uint256"
      }
    ],
    "name": "setTableRewardPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "roomCardId",
        "type": "uint256"
      }
    ],
    "name": "startGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "state",
    "outputs": [
      {
        "internalType": "enum GameState",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tableId",
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
    "stateMutability": "payable",
    "type": "receive"
  }
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
export const bankerRemovePlayer = abi.find(x => "name" in x && x.name === "bankerRemovePlayer");
export const nextStep = abi.find(x => "name" in x && x.name === "nextStep");
export const playerContinue = abi.find(x => "name" in x && x.name === "playerContinue");
export const playerFold = abi.find(x => "name" in x && x.name === "playerFold");
export const liquidateInactiveTable = abi.find(x => "name" in x && x.name === "liquidateInactiveTable");
export const getAllPlayerData = abi.find(x => "name" in x && x.name === "getAllPlayerData");
export const getPlayerData = abi.find(x => "name" in x && x.name === "getPlayerData");
export const getTableInfo = abi.find(x => "name" in x && x.name === "getTableInfo");
export const GameTableChanged = abi.find(x => "name" in x && x.name === "GameTableChanged");
