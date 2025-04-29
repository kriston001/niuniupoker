// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./BBTypes.sol";

struct BBPlayer {
    address addr;
    PlayerState state;

    uint256 totalBet;

    bool hasActedThisRound;   // 本轮是否已操作
    bool isWinner;   // 是否为赢家

    uint8[5] cards;
    CardType cardType;

    uint256[10] __gap;
}

library BBPlayerLib {
    /**
     * @dev 玩家准备
     */
    function playerReady(BBPlayer storage self) internal {
        self.state = PlayerState.READY;
    }

    /**
     * @dev 玩家取消准备
     */
    function playerUnready(BBPlayer storage self) internal {
        self.state = PlayerState.JOINED;
    }

    /**
     * @dev 玩家加入
     */
    function playerJoin(BBPlayer storage self) internal {
        self.state = PlayerState.JOINED;
    }

    /**
     * @dev 玩家弃牌
     */
    function playerFold(BBPlayer storage self) internal {
        self.state = PlayerState.FOLDED;
        self.hasActedThisRound = true;
    }

    /**
     * @dev 玩家继续游戏
     */
    function playerContinue(BBPlayer storage self, uint256 additionalBet) internal {
        self.totalBet += additionalBet;
        self.state = PlayerState.ACTIVE;
        self.hasActedThisRound = true;
    }

    /**
     * @dev 是否有效
     */
    function isValid(BBPlayer storage self) internal view returns (bool) {
        return self.addr != address(0);
    }

    /**
     * @dev 重置玩家数据
     */
    function playerReset(BBPlayer storage self) internal {
        self.state = PlayerState.JOINED;
        self.hasActedThisRound = false;
        self.totalBet = 0;
        self.isWinner = false;
        self.cards = [0, 0, 0, 0, 0];
        self.cardType = CardType.NONE;
    }
}
