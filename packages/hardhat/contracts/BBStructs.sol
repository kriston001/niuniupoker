// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./BBTypes.sol";
import "./BBPlayer.sol";

/**
 * @title BBStructs
 * @dev 牛牛游戏结构体定义
 */

struct GameConfig {
    uint8 maxRoomCount;
    uint8 maxPlayers;
    uint8 maxJoinTablesCount;
    uint8 maxBankerFeePercent;
    uint256 playerTimeout;
    uint256 tableInactiveTimeout;
    uint8 liquidatorFeePercent;
    address gameMainAddress;
    address rewardPoolAddress;
    address roomCardAddress;
    address roomLevelAddress;
    address gameTableFactoryAddress;
}

// 奖励池结构
struct RewardPoolInfo {
    uint256 poolId;           // 奖励池ID
    string name;              // 奖励池名称
    address banker;           // 创建者（庄家）地址
    uint256 totalAmount;      // 总奖池金额
    uint256 rewardPerGame;    // 每局游戏奖励金额
    uint256 winProbability;   // 中奖概率（以百分之一为单位）
    uint256 remainingAmount;  // 剩余奖池金额
    bool inUse;              // 是否正在使用

    uint256[10] __gap;
}

struct RoomCardNftType {
    uint256 id;              // Unique identifier for the card type
    string name;             // Name of the card type (e.g., "SILVER", "GOLD", "DIAMOND")
    uint8 maxPlayers;        // Maximum number of players allowed
    uint256 price;           // Price to purchase this card
    string uriSuffix;        // URI suffix for metadata
    bool active;             // Whether this card type is active
    uint256 maxMint;         // Maximum mint amount for this card type
    string rarity;           // Rarity of the card type
    uint256 minted;          // 已mint数量

    uint256[10] __gap;
}

// 定义卡片详细信息结构体
struct RoomCardNftDetail {
    uint256 tokenId;       // 卡片的token ID
    RoomCardNftType nftType;     // 继承CardType的所有属性
}

// Room level structure
struct RoomLevelNftType {
    uint256 id;              // Unique identifier for the level type
    string name;             // Name of the level (e.g., "BRONZE", "SILVER", "GOLD")
    uint256 maxRooms;        // Maximum number of rooms allowed with this level
    uint256 price;           // Price to purchase this level
    string uriSuffix;        // URI suffix for metadata
    bool active;             // Whether this level type is active
    uint256 maxMint;         // Maximum mint amount for this level type
    uint256 minted;          // Already minted amount for this level type
    string rarity;           // Rarity of this level type

    uint256[10] __gap;
}

// Level details structure for returning comprehensive information
struct RoomLevelNftDetail {
    uint256 tokenId;         // Level token ID
    RoomLevelNftType nftType;     // Level type information
}

// 添加一个新的结构体用于返回游戏桌信息
struct GameTableView {
    bool active;
    uint256 gameRound;
    uint256 gameLiquidatedCount;
    address tableAddr; // 游戏桌合约地址
    uint256 tableId;
    string tableName;
    address bankerAddr;
    uint256 betAmount;
    uint8 bankerFeePercent;
    uint256 totalPrizePool;
    uint8 playerCount;
    uint8 maxPlayers;
    uint256 creationTimestamp;
    uint256 liquidateDeadline;
    GameState state;
    uint8 liquidatorFeePercent;
    uint8 playerContinuedCount;
    uint8 playerReadyCount;
    address[] playerAddresses;
    uint256 currentRoundDeadline;
    uint256 playerTimeout;
    uint256 tableInactiveTimeout;
    uint256 lastActivityTimestamp;
    uint256 rewardPoolId;
    RewardPoolInfo rewardPoolInfo; // 奖励池信息，如果没有奖励池，则返回空结构体
    uint256 implementationVersion; // 添加实现版本号
    uint8 firstBetX;
    uint8 secondBetX;
    uint256 bankerStakeAmount;
    bool canNext;
    string nextTitle;
    string nextReason;
    address rewardAddr;
    uint256 rewardAmount;
    string chatGroupId;
}

// 添加一个新的结构体用于返回游戏桌信息
struct GameTableInfoShort {
    bool active;
    uint256 gameRound;
    uint256 gameLiquidatedCount;
    address tableAddr; // 游戏桌合约地址
    uint256 tableId;
    string tableName;
    address bankerAddr;
    uint256 betAmount;
    uint8 bankerFeePercent;
    uint8 playerCount;
    uint8 maxPlayers;
    GameState state;
    uint256 lastActivityTimestamp;
    uint256 rewardPoolId;
    RewardPoolInfo rewardPoolInfo; // 奖励池信息，如果没有奖励池，则返回空结构体
}

struct UserInfo {
    address[] tables;
    address[] joinedTables;
    mapping(address => uint256) joinedTableIndex;
}