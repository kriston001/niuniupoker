// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBTypes.sol";
import "./BBCardUtils.sol";

/**
 * @title BBCardDealer
 * @dev 牌局管理工具，负责发牌和记录已发的牌
 */
library BBCardDealer {
    struct DealerState {
        mapping(address => uint8[5]) playerCards;  // 每个玩家的牌
        mapping(address => uint8) cardCount;       // 每个玩家已发的牌数量
        mapping(address => BBTypes.CardType) cardTypes; // 每个玩家的牌型
        uint256 lastSeed;                          // 上次使用的随机种子
    }
    
    /**
     * @dev 初始化发牌状态
     */
    function initialize(DealerState storage self, uint256 seed) internal {
        self.lastSeed = seed;
    }
    
    /**
     * @dev 生成单张牌，确保不与玩家已有牌重复
     */
    function generateCard(DealerState storage self, address player, uint256 seed) internal returns (uint8) {
        uint8 cardIndex = self.cardCount[player];
        uint256 hash = uint256(keccak256(abi.encodePacked(seed, player, cardIndex)));
        
        // 生成1-52的牌
        uint8 newCard = uint8((hash % 52) + 1);
        
        // 确保不与玩家已有牌重复
        bool duplicate;
        do {
            duplicate = false;
            for (uint8 j = 0; j < cardIndex; j++) {
                if (self.playerCards[player][j] == newCard) {
                    duplicate = true;
                    hash = uint256(keccak256(abi.encodePacked(hash, "retry")));
                    newCard = uint8((hash % 52) + 1);
                    break;
                }
            }
        } while (duplicate);
        
        // 保存新牌到玩家的牌组中
        self.playerCards[player][cardIndex] = newCard;
        self.cardCount[player]++;
        
        return newCard;
    }
    
    /**
     * @dev 为玩家发指定数量的牌
     * @param self 发牌状态
     * @param player 玩家地址
     * @param count 要发的牌数量
     * @param seed 随机种子
     * @return 新发的牌
     */
    function dealCards(DealerState storage self, address player, uint8 count, uint256 seed) internal returns (uint8[] memory) {
        uint8[] memory newCards = new uint8[](count);
        
        for (uint8 i = 0; i < count; i++) {
            newCards[i] = generateCard(self, player, seed + i);
        }
        
        return newCards;
    }
    
    /**
     * @dev 获取玩家的所有牌
     */
    function getPlayerCards(DealerState storage self, address player) internal view returns (uint8[] memory) {
        uint8 count = self.cardCount[player];
        uint8[] memory cards = new uint8[](count);
        
        for (uint8 i = 0; i < count; i++) {
            cards[i] = self.playerCards[player][i];
        }
        
        return cards;
    }
    
    /**
     * @dev 计算玩家的牌型（当有5张牌时）
     */
    function calculateCardType(DealerState storage self, address player) internal returns (BBTypes.CardType) {
        require(self.cardCount[player] == 5, "Player must have 5 cards to calculate card type");
        
        uint8[5] memory cards;
        for (uint8 i = 0; i < 5; i++) {
            cards[i] = self.playerCards[player][i];
        }
        
        BBTypes.CardType cardType = BBCardUtils.calculateCardType(cards);
        self.cardTypes[player] = cardType;
        
        return cardType;
    }
    
    /**
     * @dev 获取玩家的牌型
     */
    function getCardType(DealerState storage self, address player) internal view returns (BBTypes.CardType) {
        return self.cardTypes[player];
    }
    
    /**
     * @dev 获取玩家的指定张数牌
     * @param player 玩家地址
     * @param count 要获取的牌数量
     * @return 指定数量的牌
     */
    function getPlayerCardsWithCount(DealerState storage self, address player, uint8 count) internal view returns (uint8[] memory) {
        require(count <= self.cardCount[player], "Not enough cards");
        
        uint8[] memory cards = new uint8[](count);
        
        for (uint8 i = 0; i < count; i++) {
            cards[i] = self.playerCards[player][i];
        }
        
        return cards;
    }
    
    /**
     * @dev 重置玩家的牌
     */
    function resetPlayerCards(DealerState storage self, address player) internal {
        self.cardCount[player] = 0;
        self.cardTypes[player] = BBTypes.CardType.NO_BULL;
    }
    
    /**
     * @dev 根据轮次为多个玩家发牌
     * @param self 发牌状态
     * @param players 玩家地址数组
     * @param round 当前轮次(1=第一轮发3张, 2=第二轮发1张, 3=第三轮发1张)
     */
    function dealCardsByRoundForPlayers(
        DealerState storage self, 
        address[] memory players, 
        uint8 round
    ) internal {
        require(round >= 1 && round <= 3, "Round must be between 1 and 3");
        
        // 根据轮次确定发牌数量
        uint8 cardCount;
        if (round == 1) {
            cardCount = 3; // 第一轮发3张
        } else {
            cardCount = 1; // 第二轮和第三轮各发1张
        }
        
        // 更新随机种子，加入轮次信息增加随机性
        self.lastSeed = uint256(keccak256(abi.encodePacked(self.lastSeed, round, block.timestamp)));
        
        // 为每个玩家发牌
        for (uint i = 0; i < players.length; i++) {
            address player = players[i];
            // 使用玩家索引作为额外的随机性来源
            dealCards(self, player, cardCount, self.lastSeed + i);
        }
    }
    
    
    /**
     * @dev 获取玩家的所有五张牌
     */
    function getPlayerAllCards(DealerState storage self, address player) internal view returns (uint8[5] memory) {
        uint8[5] memory allCards;
        for (uint8 i = 0; i < 5; i++) {
            allCards[i] = self.playerCards[player][i];
        }
        return allCards;
    }
}