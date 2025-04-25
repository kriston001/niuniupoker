// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./BBTypes.sol";

struct BBPlayer {
    address addr;
    PlayerState state;

    uint256 totalBet;

    bool hasActedThisRound;   // 本轮是否已操作
    
    bool committed;            // 是否提交随机种子哈希
    bytes32 commitHash;        // 提交的随机值哈希
    uint256 revealedValue;     // 揭晓的随机数

    uint8[5] cards;
    CardType cardType;

    uint256[10] __gap;
}

library BBPlayerLib {
    function computeCommitment(
        address _playerAddress,
        uint256 _randomValue,
        bytes32 _salt
    ) internal pure returns (bytes32) {
        return keccak256(
            bytes.concat(
                bytes32(_randomValue),
                bytes20(_playerAddress),
                _salt
            )
        );
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
     * @dev 玩家提交随机数
     */
    function playerCommit(BBPlayer storage self, bytes32 commitment) internal {
        self.committed = true;
        self.commitHash = commitment;
        self.state = PlayerState.COMMITTED;
        self.hasActedThisRound = true;
    }

    /**
     * @dev 玩家揭示随机数
     */
    function playerReveal(BBPlayer storage self, uint256 randomValue, bytes32 salt) internal returns(bool) {
        if(!self.committed){
            return false;
        }
        bytes32 commitment = computeCommitment(self.addr, randomValue, salt);
        if(commitment != self.commitHash){
            self.revealedValue = randomValue;
            self.state = PlayerState.REVEALED;
            self.hasActedThisRound = true;
            return true;
        }else{
            return false;
        }   
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
        self.committed = false;
        self.commitHash = 0;
        self.revealedValue = 0;
        self.totalBet = 0;
        self.cards = [0, 0, 0, 0, 0];
        self.cardType = CardType.NONE;
    }
}
