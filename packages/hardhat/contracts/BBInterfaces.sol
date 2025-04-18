// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBTypes.sol";
import "./BBStructs.sol";

interface IRandomnessManager {
    function getSessionStatus(address, uint256) external view returns (SessionState, uint256, uint256, uint256, uint256, uint256);
    function commitRandom(address, uint256, bytes32) external;
    function goReveal(uint256) external returns (bool);
    function revealRandom(address, uint256, uint256, bytes32) external;
    function completeSession(uint256) external returns (uint256);
    function hasCommitted(address, uint256, address) external view returns (bool);
    function hasRevealed(address, uint256, address) external view returns (bool);
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
}