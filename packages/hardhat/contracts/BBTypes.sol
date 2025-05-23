// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title BBTypes
 * @dev 牛牛游戏类型定义
 */

// 游戏状态
enum GameState {
    NONE,
    WAITING,
    FIRST_BETTING,
    SECOND_BETTING,
    ENDED,
    SETTLED,
    LIQUIDATED
}

// 玩家状态
enum PlayerState {
    NONE,
    JOINED,
    READY,
    ACTIVE,       // 当前参与游戏中，未弃牌
    FOLDED        // 弃牌
}

// 牌型
enum CardType {
    NONE,
    NO_BULL,
    BULL_1,
    BULL_2,
    BULL_3,
    BULL_4,
    BULL_5,
    BULL_6,
    BULL_7,
    BULL_8,
    BULL_9,
    BULL_BULL,
    FIVE_BOMB,
    FIVE_SMALL,
    FIVE_FLOWERS
}
