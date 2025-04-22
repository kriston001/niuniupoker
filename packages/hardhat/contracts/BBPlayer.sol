// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./BBTypes.sol";
import "./BBVersion.sol";

struct BBPlayer {
    address addr;
    PlayerState state;

    // 下注信息
    uint256 initialBet;
    uint256 additionalBet1;
    uint256 additionalBet2;

    uint8[5] cards;
    CardType cardType;

    uint256[10] __gap;
}

library BBPlayerLib {
    // 使用集中版本管理
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }
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
        if(self.state == PlayerState.READY){
            self.state = PlayerState.FIRST_FOLDED;
        }else{
            self.state = PlayerState.SECOND_FOLDED;
        }
    }

    /**
     * @dev 玩家继续游戏
     */
    function playerContinue(BBPlayer storage self, uint256 additionalBet) internal {
        if(self.state == PlayerState.READY){
            self.additionalBet1 = additionalBet;
            self.state = PlayerState.FIRST_CONTINUED;
        }else{
            self.additionalBet2 = additionalBet;
            self.state = PlayerState.SECOND_CONTINUED;
        }
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
        self.addr = address(0);
        self.state = PlayerState.JOINED;
        self.initialBet = 0;
        self.additionalBet1 = 0;
        self.additionalBet2 = 0;
        self.cards = [0, 0, 0, 0, 0];
        self.cardType = CardType.NONE;
    }

    /**
     * @dev 获取玩家总下注
     */
    function totalBet(BBPlayer storage self) internal view returns (uint256) {
        return self.initialBet + self.additionalBet1 + self.additionalBet2;
    }
}