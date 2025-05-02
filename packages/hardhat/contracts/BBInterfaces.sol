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
        uint8 bankerFeePercent,
        uint8 firstRaise,
        uint8 secondRaise,
        uint256 rewardPoolId
    ) external returns (address);
}

interface IGameTableImplementation {
    function bankerAddr() external view returns (address);
    function getTableInfo() external view returns (GameTableView memory);
    function getTableInfoShort() external view returns (GameTableInfoShort memory);
    function lastActivityTimestamp() external view returns (uint256);
    function state() external view returns (GameState);
    function rewardPoolId() external view returns (uint256);
    function initialize(
        uint256 _tableId,
        string memory _tableName,
        address _bankerAddr,
        uint256 _betAmount,
        uint8 _maxPlayers,
        address _gameMainAddr,
        uint8 _bankerFeePercent,
        uint8 _firstRaise,
        uint8 _secondRaise,
        uint256 _rewardPoolId,
        uint256 _implementationVersion
    ) external;
}

interface IGameMain {
    function isValidGameTable(address) external view returns (bool);
    function liquidatorFeePercent() external view returns (uint256);
    function playerTimeout() external view returns (uint256);
    function tableInactiveTimeout() external view returns (uint256);
    function rewardPoolAddress() external view returns (address);
    function roomCardAddress() external view returns (address);
    function roomLevelAddress() external view returns (address);
    function getGameConfig() external view returns (GameConfig memory);
    function rewardPoolIsInUse(address, uint256) external view returns (bool);
    function userJoinTable(address userAddr) external;
    function userLeaveTable(address userAddr) external;
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