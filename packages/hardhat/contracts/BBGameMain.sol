// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
// import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
// import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Upgradeable.sol";

import "./BBTypes.sol";
import "./BBGameTable.sol";


/**
 * @title BBGameMain
 * @dev 牛牛明牌游戏主合约，管理多个游戏桌
 */
contract BBGameMain is 
    Initializable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable
{
    // 游戏配置
    uint256 public minBet;  // 保留最小下注金额
    uint8 public maxPlayers;
    uint256 public houseFeePercent;
    uint256 public pendingHouseFee;  // 平台赚取的手续费
    uint256 public playerTimeout;  // 玩家超时时间
    uint256 public tableInactiveTimeout;  // 游戏桌不活跃超时时间

    // 新增一个数组来存储已清算的游戏桌地址
    address[] private liquidatedTableAddresses;
    
    // 游戏桌地址列表
    address[] private tableAddresses;
    mapping(address => BBGameTable) public gameTables;
    
    address public gameHistoryAddress;  // 游戏历史记录合约地址
    
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev 初始化函数，替代构造函数
     */
    function initialize(
        uint256 _minBet,
        uint8 _maxPlayers,
        uint256 _houseFeePercent,
        uint256 _playerTimeout,
        uint256 _tableInactiveTimeout
    ) public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        minBet = _minBet;
        maxPlayers = _maxPlayers;
        houseFeePercent = _houseFeePercent;
        playerTimeout = _playerTimeout;
        tableInactiveTimeout = _tableInactiveTimeout;
    }
    
    /**
     * @dev 创建新游戏桌，调用者成为庄家
     * @param tableName 游戏桌名称
     * @param betAmount 固定押注金额
     * @param tableMaxPlayers 最大玩家数量
     */
    function createGameTable(
        string memory tableName, 
        uint256 betAmount, 
        uint8 tableMaxPlayers
    ) external payable nonReentrant {
        require(betAmount >= minBet, "betAmount too small");
        require(tableMaxPlayers > 0 && tableMaxPlayers <= maxPlayers, "Invalid max players");
        require(msg.value == betAmount, "Insufficient funds");
        
        // 创建新游戏桌合约
        BBGameTable newGameTable = new BBGameTable(
            tableName,
            msg.sender,
            betAmount,
            tableMaxPlayers,
            address(this),
            playerTimeout,
            tableInactiveTimeout,
            gameHistoryAddress
        );

        address tableAddr = address(newGameTable);

        // 转账到游戏桌合约
        payable(tableAddr).transfer(betAmount);
        
        // 添加到活跃游戏列表
        tableAddresses.push(tableAddr);
        gameTables[tableAddr] = newGameTable;
        
    }

    
    /**
     * @dev 平台提取手续费
     * @notice 只有平台所有者可以调用
     */
    function withdrawHouseFee() external nonReentrant onlyOwner returns (uint256) {
        uint256 amount = pendingHouseFee;
        require(amount > 0, "No fees to withdraw");
        
        pendingHouseFee = 0;
        
        // 转账给平台所有者
        payable(owner()).transfer(amount);
        
        return amount;
    }
    
    /**
     * @dev 查询可提取平台手续费
     */
    function getWithdrawableHouseFee() external view returns (uint256) {
        return pendingHouseFee;
    }

    
    /**
     * @dev 暂停合约（仅限合约拥有者）
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约（仅限合约拥有者）
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 更新游戏配置（仅限合约拥有者）
     */
    function updateGameConfig(
        uint256 _minBet,
        uint8 _maxPlayers,
        uint256 _houseFeePercent
    ) external onlyOwner {
        minBet = _minBet;
        maxPlayers = _maxPlayers;
        houseFeePercent = _houseFeePercent;
    }

    /**
     * @dev 批量清理不活跃游戏桌
     * @param batchSize 每次处理的最大数量
     */
    function batchCleanupInactiveTables(uint256 batchSize) external nonReentrant {
        uint256 processed = 0;
        
        for (uint256 i = 0; i < tableAddresses.length && processed < batchSize; i++) {
            address tableAddr = tableAddresses[i];
            BBGameTable gameTable = gameTables[tableAddr];
            
            // 检查是否可以清算
            if (block.timestamp > gameTable.lastActivityTimestamp() + gameTable.tableInactiveTimeout() &&
                gameTable.state() != BBTypes.GameState.LIQUIDATED && gameTable.state() != BBTypes.GameState.ENDED) {
                
                // 尝试清算
                (bool success, ) = tableAddr.call(
                    abi.encodeWithSignature("liquidateInactiveTable()")
                );
                
                // 如果清算成功，计数器加一
                if (success) {
                    processed++;
                }
            }
        }
    }

    /**
     * @dev 从列表中移除游戏桌
     * @param tableAddr 要移除的游戏桌地址
     */
    function removeGameTable(address tableAddr) external nonReentrant {
        // 安全检查：只允许游戏桌合约自己调用此函数
        require(msg.sender == tableAddr, "Only table contract can remove itself");
        
        // 查找游戏桌在数组中的位置
        uint256 index = type(uint256).max;
        for (uint256 i = 0; i < tableAddresses.length; i++) {
            if (tableAddresses[i] == tableAddr) {
                index = i;
                break;
            }
        }
        
        // 确保找到了游戏桌
        require(index != type(uint256).max, "Table not found");
        
        // 从数组中移除（通过将最后一个元素移到要删除的位置，然后删除最后一个元素）
        if (index < tableAddresses.length - 1) {
            tableAddresses[index] = tableAddresses[tableAddresses.length - 1];
        }
        tableAddresses.pop();
        
        // 从映射中删除
        delete gameTables[tableAddr];

        // 将被清算的游戏桌地址添加到已清算的游戏桌列表中
        liquidatedTableAddresses.push(tableAddr);
    }
    
    
    
    /**
     * @dev 获取所有活跃游戏桌的信息
     * @return 返回游戏桌信息数组
     */
    function getAllGameTables() external view returns(GameTableView[] memory) {
        uint256 tableCount = tableAddresses.length;
        GameTableView[] memory tables = new GameTableView[](tableCount);

        for (uint256 i = 0; i < tableCount; i++) {
            address tableAddr = tableAddresses[i];
            BBGameTable gameTable = gameTables[tableAddr];
            // 直接从合约实例获取信息
            tables[i] = gameTable.getTableInfo();
        }

        return tables;
    }

    /**
     * @dev 获取所有非活跃游戏桌的信息
     * @return 返回游戏桌信息数组
     */
    function getAllGameTablesInactive() external view returns(GameTableView[] memory) {
        uint256 tableCount = tableAddresses.length;
        GameTableView[] memory tables = new GameTableView[](tableCount);

        for (uint256 i = 0; i < tableCount; i++) {
            address tableAddr = tableAddresses[i];
            BBGameTable gameTable = gameTables[tableAddr];
            //超过清算时间并且状态不是清算或者结束的table可以被清算
            if(gameTable.lastActivityTimestamp() + gameTable.tableInactiveTimeout() > block.timestamp && gameTable.state() != BBTypes.GameState.ENDED){
                tables[i] = gameTable.getTableInfo();
            }
        }

        return tables;
    }
    
    /**
     * @dev 获取指定地址的游戏桌信息
     * @param tableAddr 游戏桌合约地址
     * @return 返回游戏桌信息
     */
    function getGameTableInfo(address tableAddr) external view returns (GameTableView memory) {
        require(tableAddr != address(0), "Table does not exist");
        BBGameTable gameTable = gameTables[tableAddr];
        return gameTable.getTableInfo();
        // return GameTableView({
        //     tableAddr: tableAddr,
        //     tableName: gameTable.tableName(),
        //     bankerAddr: gameTable.bankerAddr(),
        //     betAmount: gameTable.betAmount(),
        //     totalPrizePool: gameTable.totalPrizePool(),
        //     playerCount: gameTable.playerCount(),
        //     maxPlayers: gameTable.maxPlayers(),
        //     creationTimestamp: gameTable.creationTimestamp(),
        //     state: gameTable.state(),
        //     playerContinuedCount: gameTable.playerContinuedCount(),
        //     playerFoldCount: gameTable.playerFoldCount(),
        //     playerReadyCount: gameTable.playerReadyCount(),
        //     playerAddresses: gameTable.getPlayerAddresses(),
        //     currentRoundDeadline: gameTable.currentRoundDeadline(),
        //     playerTimeout: gameTable.playerTimeout(),
        //     tableInactiveTimeout: gameTable.tableInactiveTimeout(),
        //     lastActivityTimestamp: gameTable.lastActivityTimestamp()
        // });
    }

    /**
     * @dev 获取我参与的并且活跃状态的赌桌
     * @return 返回游戏桌信息
     */
    function getMyGameTablesActive() external view returns (GameTableView[] memory) {
        // 第一次遍历计算数量
        uint256 count = 0;
        for (uint256 i = 0; i < tableAddresses.length; i++) {
            if (gameTables[tableAddresses[i]].isPlayer(msg.sender)) {
                count++;
            }
        }
        
        // 创建正确大小的数组
        GameTableView[] memory tables = new GameTableView[](count);
        
        // 第二次遍历填充数据
        uint256 index = 0;
        for (uint256 i = 0; i < tableAddresses.length; i++) {
            address tableAddr = tableAddresses[i];
            if (gameTables[tableAddr].isPlayer(msg.sender)) {
                tables[index] = gameTables[tableAddr].getTableInfo();
                index++;
            }
        }
        
        return tables;
    }

    // 添加一个内部函数来获取游戏桌信息
    function _getTableInfo(address tableAddr) internal view returns (GameTableView memory) {
        require(tableAddr != address(0) && address(gameTables[tableAddr]) != address(0), "Table does not exist");
        BBGameTable gameTable = gameTables[tableAddr];
        return gameTable.getTableInfo();
    }

    // 验证游戏桌是否合法
    function isValidGameTable(address tableAddr) external view returns (bool) {
        return address(gameTables[tableAddr]) == tableAddr;
    }

    //设置游戏历史记录合约地址
    function setGameHistoryAddress(address _gameHistoryAddress) external onlyOwner nonReentrant{
        gameHistoryAddress = _gameHistoryAddress;
    }

    // 授权升级
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev 需要接收资金的合约必须要实现的函数
     */
    receive() external payable {}
}

    