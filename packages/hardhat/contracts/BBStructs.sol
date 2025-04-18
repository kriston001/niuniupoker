// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title BBStructs
 * @dev 牛牛游戏结构体定义
 */

struct GameConfig {
    uint256 minBet;
    uint8 maxPlayers;
    uint256 maxBankerFeePercent;
    uint256 playerTimeout;
    uint256 tableInactiveTimeout;
    uint256 liquidatorFeePercent;
    address gameHistoryAddress;
    address rewardPoolAddress;
    address randomnessManagerAddress;
    address roomCardAddress;
    address roomLevelAddress;
    address gameTableFactoryAddress;
}

// 奖励池结构
struct RewardPoolInfo {
    uint256 poolId;           // 奖励池ID
    address banker;           // 创建者（庄家）地址
    uint256 totalAmount;      // 总奖池金额
    uint256 rewardPerGame;    // 每局游戏奖励金额
    uint256 winProbability;   // 中奖概率（以百分之一为单位）
    uint256 remainingAmount;  // 剩余奖池金额
}

struct RoomCardNftType {
    uint256 id;              // Unique identifier for the card type
    string name;             // Name of the card type (e.g., "SILVER", "GOLD", "DIAMOND")
    uint256 maxBetAmount;    // Maximum bet amount allowed with this card
    uint8 maxPlayers;        // Maximum number of players allowed
    uint256 price;           // Price to purchase this card
    string uriSuffix;        // URI suffix for metadata
    bool active;             // Whether this card type is active
    uint256 maxMint;         // Maximum mint amount for this card type
    string rarity;           // Rarity of the card type
    uint256 minted;          // 已mint数量
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
}
