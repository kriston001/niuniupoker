// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBTypes.sol";
import "./BBStructs.sol";

interface IRandomnessManager {
    function createSession() external returns (bool);
    function startCommit(address[] calldata, uint256) external returns (uint256);
    function commitRandom(address, bytes32) external;
    function startReveal() external returns (uint256);
    function revealRandom(address _playerAddress, uint256 _randomValue, bytes32 _salt) external;
    function completeSession() external returns (uint256);
    function hasCommitted(address, address) external view returns (bool);
    function hasRevealed(address, address) external view returns (bool);
    function getSessionDeadline(address) external view returns (uint256);
}

interface IGameMain {
    function isValidGameTable(address) external view returns (bool);
    function liquidatorFeePercent() external view returns (uint256);
    function playerTimeout() external view returns (uint256);
    function tableInactiveTimeout() external view returns (uint256);
    function gameHistoryAddress() external view returns (address);
    function rewardPoolAddress() external view returns (address);
    function roomCardAddress() external view returns (address);
    function roomLevelAddress() external view returns (address);
    function randomnessManagerAddress() external view returns (address);
    function getGameConfig() external view returns (GameConfig memory);
    function rewardPoolIsInUse(address, uint256) external view returns (bool);
}

interface IRewardPool{
    function tryDistributeReward(address, address[] calldata) external returns (bool);
    function isBankerPool(address, uint256) external view returns (bool);
}

interface IRoomCardNFT{
    function validateParams(uint256, uint8) external view returns (bool);
    function hasNft(address) external view returns (bool);
    function consume(address, uint256) external;
}