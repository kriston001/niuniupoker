// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBCardUtils.sol";
import "./BBTypes.sol";

/**
 * @title BBCardDealer
 * @dev 牌局管理工具，负责发牌和记录已发的牌
 * @notice 进行了以下优化：
 *  - 改进随机性处理
 *  - 优化避免重复牌的算法
 *  - 明确使用标准52张扑克牌(无大小王)
 *  - 增加边界检查
 *  - 减少 gas 消耗
 *  - 添加事件通知
 *  - 完善 NatSpec 文档
 */
library BBCardDealer {
    // 牌组常量
    uint8 internal constant TOTAL_CARDS = 52; // 标准52张扑克牌(无大小王)

    /**
     * @dev 发牌管理器状态
     */
    struct DealerState {
        mapping(uint8 => bool) usedCards; // 已使用的牌
        uint256 lastSeed;      // 上次使用的随机种子
    }

    /**
     * @dev 初始化发牌状态(使用默认的5张牌)
     * @param self 发牌状态
     * @param newSeed 初始随机种子
     */
    function initialize(DealerState storage self, uint256 newSeed) internal {
        self.lastSeed = uint256(keccak256(abi.encodePacked(
            self.lastSeed,
            block.prevrandao,
            block.timestamp,
            newSeed
        )));
    }

    /**
     * @dev 重置发牌状态
     * @param self 发牌状态
     */
    function reset(DealerState storage self) internal {
        // Clear all used cards by iterating through 1 to TOTAL_CARDS
        for (uint8 i = 1; i <= TOTAL_CARDS; i++) {
            self.usedCards[i] = false;
        }

        // 重置随机种子
        self.lastSeed = block.timestamp;
    }

    /**
     * @dev 使用改进的算法生成单张牌，确保不与玩家已有牌重复
     * @param self 发牌状态
     * @param player 玩家地址
     * @return 新生成的牌 (1-52范围内)
     */
    function generateCard(
        DealerState storage self, 
        address player,
        uint8 count
    ) internal returns (uint8) {        
        // 生成1-52的牌 (标准52张扑克牌，无大小王)
        uint8 newCard;
        uint8 attempts = 0;
        
        // 使用映射快速检查是否重复，最多尝试25次
        do {
            uint256 hash = uint256(keccak256(abi.encodePacked(self.lastSeed, player, count, attempts)));
            // 确保范围在1-52之间 (% TOTAL_CARDS + 1)
            newCard = uint8((hash % TOTAL_CARDS) + 1);
            attempts++;
            
            // 防止无限循环
            require(attempts <= 25, "Failed to generate unique card");
            
        } while (self.usedCards[newCard]);
        
        // 记录该牌已被使用
        self.usedCards[newCard] = true;

        return newCard;
    }

    /**
     * @dev 为玩家发指定数量的牌
     * @param self 发牌状态
     * @param player 玩家地址
     * @param count 要发的牌数量
     * @return 新发的牌
     */
    function dealCards(
        DealerState storage self, 
        address player, 
        uint8 count
    ) internal returns (uint8[] memory) {            
        uint8[] memory newCards = new uint8[](count);

        for (uint8 i = 0; i < count; i++) {
            // 为每张牌使用不同的种子
            newCards[i] = generateCard(self, player, count);
        }

        return newCards;
    }

    /**
     * @dev 根据轮次为多个玩家发牌
     * @param self 发牌状态
     * @param round 当前轮次(1=第一轮发3张, 2=第二轮发1张, 3=第三轮发1张)
     */
    function dealCardsByRoundForPlayer(
        DealerState storage self,
        address player,
        uint8 round
    ) internal returns (uint8[] memory)  {
        require(round >= 1 && round <= 3, "Invalid round");

        // 根据轮次确定发牌数量
        uint8 cardCount = round == 1 ? 3 : 1;

        // 更新随机种子，加入轮次信息和区块信息增加随机性
        self.lastSeed = uint256(keccak256(abi.encodePacked(
            self.lastSeed, 
            player,
            round, 
            block.timestamp, 
            block.difficulty
        )));

        return dealCards(self, player, cardCount);
    }
}
