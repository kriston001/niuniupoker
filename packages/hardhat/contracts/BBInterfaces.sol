// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBTypes.sol";
import "./BBStructs.sol";

interface IGameTableFactory {
    function createGameTable(
        uint256 tableId,
        string memory tableName,
        address bankerAddr,
        uint256 betAmount,
        uint8 maxPlayers,
        address gameMainAddr,
        uint8 bankerFeePercent
    ) external returns (address);
}

interface IGameTableImplementation {
    function bankerAddr() external view returns (address);
    function getTableInfo() external view returns (GameTableView memory);
    function lastActivityTimestamp() external view returns (uint256);
    function state() external view returns (GameState);
    function rewardPoolId() external view returns (uint256);
    function initialize(uint256, string memory, address, uint256, uint8, address, uint8, uint256) external;
}

interface IGameMain {
    function isValidGameTable(address) external view returns (bool);
    function liquidatorFeePercent() external view returns (uint256);
    function playerTimeout() external view returns (uint256);
    function tableInactiveTimeout() external view returns (uint256);
    function rewardPoolAddress() external view returns (address);
    function roomCardAddress() external view returns (address);
    function roomLevelAddress() external view returns (address);
    function randomnessManagerAddress() external view returns (address);
    function getGameConfig() external view returns (GameConfig memory);
    function rewardPoolIsInUse(address, uint256) external view returns (bool);
}

interface IRewardPool{
    function tryDistributeReward(uint256 _poolId, address[] calldata _players, uint256 finalSeed) external  returns (address, uint256);
    function isBankerPool(address, uint256) external view returns (bool);
    function getRewardPoolInfo(address, uint256) external view returns (RewardPoolInfo memory);
}

interface IRoomCardNFT{
    function validateParams(uint256, uint8) external view returns (bool);
    function hasNft(address) external view returns (bool);
    function consume(address, uint256) external;
}