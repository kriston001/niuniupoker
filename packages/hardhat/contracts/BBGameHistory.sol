// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBErrors.sol";
import "./BBTypes.sol";
import "./BBGameTable.sol";
import "./BBVersion.sol";


interface IBBGameMain {
    function isValidGameTable(address tableAddr) external view returns (bool);
}

contract BBGameHistory is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    // 游戏记录基础信息
    struct GameRecordBase {
        address tableAddr;         // 游戏桌地址
        uint256 startTimestamp;    // 游戏开始时间
        uint256 endTimestamp;      // 游戏结束时间
        uint256 totalPrizePool;    // 奖池总额
        address[] players;         // 参与玩家
        address[] winners;         // 获胜玩家
        BBTypes.CardType maxCardType;  // 最大牌型
    }

    // 记录索引计数器
    uint256 private recordCounter;

    // 所有游戏记录的基础信息
    mapping(uint256 => GameRecordBase) public gameRecordBases;

    // 玩家数据映射 (recordIndex => playerAddress => playerData)
    mapping(uint256 => mapping(address => BBPlayer)) public playersData;

    // 玩家参与的游戏记录索引
    mapping(address => uint256[]) private playerGameIndices;

    // 游戏桌地址到游戏记录索引的映射
    mapping(address => uint256[]) private tableGameIndices;

    // 游戏主合约地址
    address public gameMainAddr;

    // 使用集中版本管理
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // 初始化函数，替代构造函数
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        recordCounter = 0;
    }

    // 记录新的游戏结果
    function recordGame(
        uint256 startTime,
        uint256 endTime,
        uint256 totalPrizePool,
        address[] memory playerAddrs,
        address[] memory winnerAddrs,
        BBPlayerEntry[] memory playerEntries,
        BBTypes.CardType maxCardType
    ) external {
        address tableAddr = msg.sender;
        if (gameMainAddr == address(0) || !IBBGameMain(gameMainAddr).isValidGameTable(tableAddr)) revert InvalidGameTable();

        uint256 recordIndex = recordCounter;
        recordCounter++;

        // 存储基础信息
        gameRecordBases[recordIndex].tableAddr = tableAddr;
        gameRecordBases[recordIndex].startTimestamp = startTime;
        gameRecordBases[recordIndex].endTimestamp = endTime;
        gameRecordBases[recordIndex].totalPrizePool = totalPrizePool;
        gameRecordBases[recordIndex].maxCardType = maxCardType;

        // 存储玩家和获胜者
        for (uint i = 0; i < playerAddrs.length; i++) {
            gameRecordBases[recordIndex].players.push(playerAddrs[i]);
        }

        for (uint i = 0; i < winnerAddrs.length; i++) {
            gameRecordBases[recordIndex].winners.push(winnerAddrs[i]);
        }

        // 记录玩家数据并更新索引
        for (uint i = 0; i < playerEntries.length; i++) {
            address player = playerEntries[i].playerAddr;
            playersData[recordIndex][player] = playerEntries[i].playerData;
            playerGameIndices[player].push(recordIndex);
        }

        // 记录游戏桌索引
        tableGameIndices[tableAddr].push(recordIndex);
    }

    // 获取玩家的游戏记录
    function getPlayerGameRecords(address player) external view returns (
        address[] memory tableAddrs,
        uint256[] memory startTimes,
        uint256[] memory endTimes,
        uint256[] memory prizePools,
        bool[] memory isWinner,
        BBTypes.CardType[] memory cardTypes
    ) {
        uint256[] storage indices = playerGameIndices[player];
        uint256 count = indices.length;

        tableAddrs = new address[](count);
        startTimes = new uint256[](count);
        endTimes = new uint256[](count);
        prizePools = new uint256[](count);
        isWinner = new bool[](count);
        cardTypes = new BBTypes.CardType[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 recordIndex = indices[i];
            GameRecordBase storage record = gameRecordBases[recordIndex];

            tableAddrs[i] = record.tableAddr;
            startTimes[i] = record.startTimestamp;
            endTimes[i] = record.endTimestamp;
            prizePools[i] = record.totalPrizePool;
            cardTypes[i] = playersData[recordIndex][player].cardType;

            // 检查是否是赢家
            for (uint256 j = 0; j < record.winners.length; j++) {
                if (record.winners[j] == player) {
                    isWinner[i] = true;
                    break;
                }
            }
        }
    }

    // 获取特定游戏记录的基础信息
    function getGameRecordBase(uint256 recordIndex) external view returns (
        address tableAddr,
        uint256 startTimestamp,
        uint256 endTimestamp,
        uint256 totalPrizePool,
        address[] memory players,
        address[] memory winners,
        BBTypes.CardType maxCardType
    ) {
        GameRecordBase storage record = gameRecordBases[recordIndex];
        return (
            record.tableAddr,
            record.startTimestamp,
            record.endTimestamp,
            record.totalPrizePool,
            record.players,
            record.winners,
            record.maxCardType
        );
    }

    // 获取玩家在特定游戏中的数据
    function getPlayerData(uint256 recordIndex, address player) external view returns (BBPlayer memory) {
        return playersData[recordIndex][player];
    }

    // 获取游戏桌的所有游戏记录索引
    function getTableGameIndices(address tableAddr) external view returns (uint256[] memory) {
        return tableGameIndices[tableAddr];
    }

    // 获取玩家的所有游戏记录索引
    function getPlayerGameIndices(address player) external view returns (uint256[] memory) {
        return playerGameIndices[player];
    }

    // 获取当前记录总数
    function getTotalRecords() external view returns (uint256) {
        return recordCounter;
    }

    // 授权升级
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    //设置主合约地址
    function setGameMainAddress(address _gameMainAddr) external onlyOwner {
        gameMainAddr = _gameMainAddr;
    }
}
