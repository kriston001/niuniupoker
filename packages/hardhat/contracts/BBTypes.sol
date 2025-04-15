// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title BBTypes
 * @dev 牛牛游戏类型定义
 */
library BBTypes {
    // 游戏状态
    enum GameState {
        NONE,
        WAITING,
        COMMITTING,   // 提交随机数阶段
        REVEALING,    // 揭示随机数阶段
        FIRST_BETTING,
        SECOND_BETTING,
        ENDED,
        LIQUIDATED,
        DISBANDED
    }

    // 玩家状态
    enum PlayerState {
        NONE,
        JOINED,
        READY,
        FIRST_FOLDED,
        FIRST_CONTINUED,
        SECOND_FOLDED,
        SECOND_CONTINUED
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
}