// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBErrors.sol";
import "./BBCardUtils.sol";
import "./BBVersion.sol";
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
    
    // 使用集中版本管理
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }

    // 事件声明
    event CardsDealt(address indexed player, uint8 count, uint8[] cards);
    event CardTypeCalculated(address indexed player, CardType cardType);
    event DealerReset();

    /**
     * @dev 发牌管理器状态
     */
    struct DealerState {
        address[] playerAddresses;
        mapping(address => uint8[5]) playerCards;         // 每个玩家的牌
        mapping(address => uint8) cardCount;              // 每个玩家已发的牌数量
        mapping(address => CardType) cardTypes;   // 每个玩家的牌型
        mapping(address => mapping(uint8 => bool)) usedCards; // 每个玩家已使用的牌
        uint256 lastSeed;                                 // 上次使用的随机种子
        uint8 maxCardsPerPlayer;                          // 每个玩家最大牌数
    }

    /**
     * @dev 初始化发牌状态
     * @param self 发牌状态
     * @param seed 初始随机种子
     * @param maxCards 每个玩家的最大牌数，默认为5
     */
    function initialize(
        DealerState storage self, 
        uint256 seed, 
        uint8 maxCards
    ) internal {
        self.lastSeed = seed;
        self.maxCardsPerPlayer = maxCards > 0 ? maxCards : 5; // 默认为5张牌
    }

    /**
     * @dev 初始化发牌状态(使用默认的5张牌)
     * @param self 发牌状态
     * @param seed 初始随机种子
     */
    function initialize(DealerState storage self, uint256 seed) internal {
        initialize(self, seed, 5);
    }

    /**
     * @dev 重置发牌状态
     * @param self 发牌状态
     */
    function reset(DealerState storage self) internal {
        // 清空每个玩家的数据
        for (uint i = 0; i < self.playerAddresses.length; i++) {
            address playerAddr = self.playerAddresses[i];
            // 清空牌数量
            self.cardCount[playerAddr] = 0;
            // 清空牌型
            self.cardTypes[playerAddr] = CardType.NONE;

            // 清空已使用的牌记录
            for (uint8 card = 1; card <= TOTAL_CARDS; card++) {
                if (self.usedCards[playerAddr][card]) {
                    self.usedCards[playerAddr][card] = false;
                }
            }
        }

        // 重置玩家地址数组长度为0 (不使用assembly)
        while (self.playerAddresses.length > 0) {
            self.playerAddresses.pop();
        }

        emit DealerReset();
    }

    /**
     * @dev 使用改进的算法生成单张牌，确保不与玩家已有牌重复
     * @param self 发牌状态
     * @param player 玩家地址
     * @param seed 随机种子
     * @return 新生成的牌 (1-52范围内)
     */
    function generateCard(
        DealerState storage self, 
        address player, 
        uint256 seed
    ) internal returns (uint8) {
        // 检查玩家牌数是否已达上限
        if (self.cardCount[player] >= self.maxCardsPerPlayer) 
            revert CardLimitExceeded();

        // 如果这是玩家的第一张牌，将玩家添加到地址列表
        if (self.cardCount[player] == 0) {
            self.playerAddresses.push(player);
        }

        uint8 cardIndex = self.cardCount[player];
        
        // 使用多个熵源提高随机性
        uint256 hash = uint256(keccak256(abi.encodePacked(
            seed, 
            player, 
            cardIndex, 
            block.timestamp, 
            block.difficulty
        )));

        // 生成1-52的牌 (标准52张扑克牌，无大小王)
        uint8 newCard;
        uint8 attempts = 0;
        
        // 使用映射快速检查是否重复，最多尝试25次
        do {
            hash = uint256(keccak256(abi.encodePacked(hash, attempts)));
            // 确保范围在1-52之间 (% TOTAL_CARDS + 1)
            newCard = uint8((hash % TOTAL_CARDS) + 1);
            attempts++;
            
            // 防止无限循环
            if (attempts > 25) revert FailedToGenerateUniqueCard();
            
        } while (self.usedCards[player][newCard]);
        
        // 记录该牌已被使用
        self.usedCards[player][newCard] = true;
        
        // 保存新牌到玩家的牌组中
        self.playerCards[player][cardIndex] = newCard;
        self.cardCount[player]++;

        // 检查是否已有5张牌，如果是则自动计算牌型
        if (self.cardCount[player] == 5) {
            calculateCardType(self, player);
        }

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
    function dealCards(
        DealerState storage self, 
        address player, 
        uint8 count, 
        uint256 seed
    ) internal returns (uint8[] memory) {
        // 检查不会超过最大牌数限制
        if (self.cardCount[player] + count > self.maxCardsPerPlayer)
            revert CardLimitExceeded();
            
        uint8[] memory newCards = new uint8[](count);

        for (uint8 i = 0; i < count; i++) {
            // 为每张牌使用不同的种子
            uint256 cardSeed = uint256(keccak256(abi.encodePacked(seed, i)));
            newCards[i] = generateCard(self, player, cardSeed);
        }

        emit CardsDealt(player, count, newCards);
        return newCards;
    }

    /**
     * @dev 获取玩家的所有牌
     * @param self 发牌状态
     * @param player 玩家地址
     * @return 玩家的所有牌
     */
    function getPlayerCards(
        DealerState storage self, 
        address player
    ) internal view returns (uint8[] memory) {
        uint8 count = self.cardCount[player];
        uint8[] memory cards = new uint8[](count);

        for (uint8 i = 0; i < count; i++) {
            cards[i] = self.playerCards[player][i];
        }

        return cards;
    }

    /**
     * @dev 计算玩家的牌型（不满5张牌时返回none）
     * @param self 发牌状态
     * @param player 玩家地址
     * @return 计算出的牌型
     */
    function calculateCardType(
        DealerState storage self, 
        address player
    ) internal returns (CardType) {
        if (self.cardCount[player] != 5) return CardType.NONE;

        uint8[5] memory cards;
        for (uint8 i = 0; i < 5; i++) {
            cards[i] = self.playerCards[player][i];
        }

        CardType cardType = BBCardUtils.calculateCardType(cards);
        self.cardTypes[player] = cardType;

        emit CardTypeCalculated(player, cardType);
        return cardType;
    }

    /**
     * @dev 获取玩家的牌型
     * @param self 发牌状态
     * @param player 玩家地址
     * @return 玩家的牌型
     */
    function getCardType(
        DealerState storage self, 
        address player
    ) internal view returns (CardType) {
        return self.cardTypes[player];
    }

    /**
     * @dev 获取玩家的指定张数牌
     * @param self 发牌状态
     * @param player 玩家地址
     * @param count 要获取的牌数量
     * @return 指定数量的牌
     */
    function getPlayerCardsWithCount(
        DealerState storage self, 
        address player, 
        uint8 count
    ) internal view returns (uint8[] memory) {
        if (count > self.cardCount[player]) revert InvalidCardCount();

        uint8[] memory cards = new uint8[](count);

        for (uint8 i = 0; i < count; i++) {
            cards[i] = self.playerCards[player][i];
        }

        return cards;
    }

    /**
     * @dev 重置玩家的牌
     * @param self 发牌状态
     * @param player 玩家地址
     */
    function resetPlayerCards(
        DealerState storage self, 
        address player
    ) internal {
        // 清空已使用的牌记录
        for (uint8 i = 0; i < self.cardCount[player]; i++) {
            uint8 card = self.playerCards[player][i];
            self.usedCards[player][card] = false;
        }
        
        self.cardCount[player] = 0;
        self.cardTypes[player] = CardType.NO_BULL;
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
        if (round < 1 || round > 3) revert InvalidRound();

        // 根据轮次确定发牌数量
        uint8 cardCount = round == 1 ? 3 : 1;

        // 更新随机种子，加入轮次信息和区块信息增加随机性
        self.lastSeed = uint256(keccak256(abi.encodePacked(
            self.lastSeed, 
            round, 
            block.timestamp, 
            block.difficulty
        )));

        // 为每个玩家发牌
        for (uint i = 0; i < players.length; i++) {
            address player = players[i];
            
            // 检查不会超过最大牌数限制
            if (self.cardCount[player] + cardCount > self.maxCardsPerPlayer)
                revert CardLimitExceeded();
                
            // 使用玩家索引和地址作为额外的随机性来源
            uint256 playerSeed = uint256(keccak256(abi.encodePacked(
                self.lastSeed, 
                i, 
                player
            )));
            
            dealCards(self, player, cardCount, playerSeed);
        }
    }

    /**
     * @dev 获取玩家的所有五张牌
     * @param self 发牌状态
     * @param player 玩家地址
     * @return 玩家的所有五张牌
     */
    function getPlayerAllCards(
        DealerState storage self, 
        address player
    ) internal view returns (uint8[5] memory) {
        // 如果玩家没有5张牌，将返回部分无效数据(0值)
        uint8[5] memory allCards;
        uint8 count = self.cardCount[player];
        
        for (uint8 i = 0; i < count; i++) {
            allCards[i] = self.playerCards[player][i];
        }
        return allCards;
    }
    
    /**
     * @dev 获取所有已注册的玩家地址
     * @param self 发牌状态
     * @return 所有玩家地址
     */
    function getAllPlayers(
        DealerState storage self
    ) internal view returns (address[] memory) {
        return self.playerAddresses;
    }
    
    /**
     * @dev 检查玩家是否已注册
     * @param self 发牌状态
     * @param player 玩家地址
     * @return 玩家是否已注册
     */
    function isPlayerRegistered(
        DealerState storage self,
        address player
    ) internal view returns (bool) {
        return self.cardCount[player] > 0;
    }
    
    /**
     * @dev 将牌索引转换为可读格式 (花色和点数)
     * @param cardIndex 牌索引 (1-52)
     * @return suit 花色 (1=黑桃, 2=红桃, 3=梅花, 4=方块)
     * @return rank 点数 (1=A, 11=J, 12=Q, 13=K)
     */
    function cardToSuitAndRank(uint8 cardIndex) internal pure returns (uint8 suit, uint8 rank) {
        // 检查范围
        if (cardIndex < 1 || cardIndex > TOTAL_CARDS) revert InvalidCardIndex();
        
        // 计算花色和点数
        // cardIndex从1开始，所以要先减1
        uint8 adjustedIndex = cardIndex - 1;
        suit = (adjustedIndex / 13) + 1; // 花色: 1=黑桃, 2=红桃, 3=梅花, 4=方块
        rank = (adjustedIndex % 13) + 1; // 点数: 1=A, 2-10, 11=J, 12=Q, 13=K
        
        return (suit, rank);
    }
}
