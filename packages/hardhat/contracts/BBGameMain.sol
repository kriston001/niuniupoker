// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBErrors.sol";


import "./BBTypes.sol";
import "./BBGameTableImplementation.sol";
import "./BBGameTableFactory.sol";
import "./BBVersion.sol";
import "./BBRoomCard.sol";
import "./BBRewardPool.sol";
import "./BBRoomLevel.sol";
import "./BBRandomnessManager.sol";

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
    uint8 public maxRoomCount;  //最大创建房间数
    uint8 public maxPlayers;
    uint256 public playerTimeout;  // 玩家超时时间
    uint256 public tableInactiveTimeout;  // 游戏桌不活跃超时时间


    // 新增一个数组来存储已清算的游戏桌地址
    address[] private liquidatedTableAddresses;
    address[] private disbandedTableAddresses;

    // 游戏桌地址列表
    address[] private tableAddresses;
    mapping(address => BBGameTableImplementation) public gameTables;

    // 记录每个用户创建的房间数量
    mapping(address => uint256) private userCreatedRoomsCount;

    address public gameHistoryAddress;  // 游戏历史记录合约地址
    address public rewardPoolAddress;    // 奖励池合约地址

    // 费用收集相关
    uint256 public maxBankerFeePercent; // 庄家抽成最大百分比
    uint256 public liquidatorFeePercent; // 清算人费用百分比

    // 房卡相关
    bool public roomCardEnabled;  // 是否启用房卡功能
    address public roomCardAddress;  // 房卡NFT合约地址

    // 房间等级相关
    address public roomLevelAddress; // 房间等级合约地址
    bool public roomLevelEnabled;    // 是否启用房间等级功能

    // 游戏桌工厂相关
    address public gameTableFactoryAddress; // 游戏桌工厂合约地址

    // 随机数管理器相关
    address public randomnessManagerAddress; // 随机数管理器合约地址

    // 使用集中版本管理
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev 初始化函数，替代构造函数
     */
    function initialize(
        uint256 _minBet,
        uint8 _maxPlayers,
        uint8 _maxRoomCount,
        uint256 _maxBankerFeePercent,
        uint256 _liquidatorFeePercent,
        uint256 _playerTimeout,
        uint256 _tableInactiveTimeout,
        address _gameTableFactoryAddress
    ) public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        minBet = _minBet;
        maxPlayers = _maxPlayers;
        maxRoomCount = _maxRoomCount;
        maxBankerFeePercent = _maxBankerFeePercent;
        liquidatorFeePercent = _liquidatorFeePercent;
        playerTimeout = _playerTimeout;
        tableInactiveTimeout = _tableInactiveTimeout;

        // 初始化游戏桌工厂地址
        if (_gameTableFactoryAddress != address(0)) {
            gameTableFactoryAddress = _gameTableFactoryAddress;
            emit GameTableFactoryAddressUpdated(_gameTableFactoryAddress);
        }
    }

    /**
     * @dev 创建新游戏桌，调用者成为庄家
     * @param tableName 游戏桌名称
     * @param betAmount 固定押注金额
     * @param tableMaxPlayers 最大玩家数量
     * @param roomCardTokenId 房卡NFT的tokenId，如果不启用房卡功能，可以传入0
     */
    function createGameTable(
        string memory tableName,
        uint256 betAmount,
        uint8 tableMaxPlayers,
        uint256 bankerFeePercent,
        uint256 roomCardTokenId,
        bool bankerIsPlayer
    ) external payable nonReentrant {
        if (paused()) revert ContractPaused();
        if (betAmount < minBet) revert BetAmountTooSmall();
        if (tableMaxPlayers <= 1 || tableMaxPlayers > maxPlayers) revert InvalidMaxPlayers();
        if (bankerFeePercent > maxBankerFeePercent) revert InvalidBankerFeePercent();

        if(bankerIsPlayer){
            if (msg.value != betAmount) revert InsufficientFunds();
        }

        // 将玩家的房间数量加1
        userCreatedRoomsCount[msg.sender]++;

        uint256 createdRooms = getUserCreatedRoomsCount(msg.sender);
        // 验证用户的房间等级和已创建的房间数量
        if (createdRooms > maxRoomCount) {
            if (roomLevelAddress == address(0)) revert InvalidRoomLevelAddress();

            // 验证用户是否拥有房间等级
            BBRoomLevel roomLevel = BBRoomLevel(payable(roomLevelAddress));
            if (!roomLevel.hasRoomLevel(msg.sender)) revert RoomLevelRequired();

            // 获取用户等等级NFT可创建的房间总数
            uint256 maxRooms = roomLevel.getMaxRooms(msg.sender);

            // 验证用户是否超过房间创建上限
            if (createdRooms > maxRooms + maxRoomCount) {
                // 如果超过上限，先将计数减回去，再抛出错误
                userCreatedRoomsCount[msg.sender]--;
                revert RoomLevelLimitExceeded();
            }
        }

        // 如果启用了房卡功能，验证并消耗房卡
        if (roomCardEnabled) {
            if (roomCardAddress == address(0)) revert InvalidRoomCardContract();

            // 验证用户是否拥有房卡
            BBRoomCard roomCard = BBRoomCard(payable(roomCardAddress));
            if (!roomCard.hasRoomCard(msg.sender)) revert NoRoomCardOwned();

            // 验证房卡参数是否符合游戏设置
            if (!roomCard.validateRoomCardParams(roomCardTokenId, betAmount, tableMaxPlayers)) {
                revert InvalidRoomCardParams();
            }

            // 消耗房卡
            try roomCard.consumeRoomCard(msg.sender, roomCardTokenId) {
                // 房卡消耗成功
            } catch {
                revert RoomCardConsumptionFailed();
            }
        }

        // 检查游戏桌工厂地址是否设置
        if (gameTableFactoryAddress == address(0)) revert InvalidGameTableFactoryAddress();

        // 检查随机数管理器地址是否设置
        if (randomnessManagerAddress == address(0)) revert InvalidAddress();

        // 使用工厂合约创建游戏桌
        BBGameTableFactory factory = BBGameTableFactory(gameTableFactoryAddress);
        address payable tableAddr = payable(factory.createGameTable(
            tableName,
            msg.sender,
            betAmount,
            tableMaxPlayers,
            address(this),
            playerTimeout,
            tableInactiveTimeout,
            gameHistoryAddress,
            bankerFeePercent,
            liquidatorFeePercent,
            bankerIsPlayer,
            rewardPoolAddress,
            randomnessManagerAddress
        ));


        // 添加到活跃游戏列表
        tableAddresses.push(tableAddr);
        gameTables[tableAddr] = BBGameTableImplementation(tableAddr);

        if(bankerIsPlayer){
            // 转账到游戏桌合约 - 使用更安全的 call 方法而不是 transfer
            (bool success, ) = payable(tableAddr).call{value: betAmount}("");
            if (!success) revert TransferFailed();
        }

        // 触发事件
        emit GameTableCreated(tableAddr, msg.sender, betAmount, tableMaxPlayers, roomCardTokenId);
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
        uint256 _maxBankerFeePercent,
        uint256 _playerTimeout,
        uint256 _tableInactiveTimeout
    ) external onlyOwner {
        if (_minBet == 0) revert MinBetMustBePositive();
        if (_maxPlayers <= 1) revert MaxPlayersTooSmall();
        if (_maxBankerFeePercent == 0) revert BankerFeePercentMustBePositive();
        if (_playerTimeout == 0) revert PlayerTimeoutMustBePositive();
        if (_tableInactiveTimeout == 0) revert TableInactiveTimeoutMustBePositive();

        minBet = _minBet;
        maxPlayers = _maxPlayers;
        maxBankerFeePercent = _maxBankerFeePercent;
        playerTimeout = _playerTimeout;
        tableInactiveTimeout = _tableInactiveTimeout;

        emit GameConfigUpdated(_minBet, _maxPlayers);
    }

    /**
     * @dev 设置房卡合约地址
     * @param _roomCardAddress 房卡合约地址
     */
    function setRoomCardAddress(address _roomCardAddress) external onlyOwner {
        if (_roomCardAddress == address(0)) revert InvalidRoomCardContract();
        roomCardAddress = _roomCardAddress;

        // 设置房卡合约的游戏主合约地址
        BBRoomCard roomCard = BBRoomCard(payable(roomCardAddress));
        roomCard.setGameMainAddress(address(this));

        emit RoomCardAddressUpdated(_roomCardAddress);
    }

    /**
     * @dev 启用或禁用房卡功能
     * @param _enabled 是否启用
     */
    function setRoomCardEnabled(bool _enabled) external onlyOwner {
        roomCardEnabled = _enabled;
        emit RoomCardEnabledUpdated(_enabled);
    }

    /**
     * @dev 批量清理不活跃游戏桌
     * @param batchSize 每次处理的最大数量
     */
    function batchCleanupInactiveTables(uint256 batchSize) external nonReentrant {
        uint256 processed = 0;

        for (uint256 i = 0; i < tableAddresses.length && processed < batchSize; i++) {
            address tableAddr = tableAddresses[i];
            BBGameTableImplementation gameTable = gameTables[tableAddr];

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
    function removeGameTable(address tableAddr, uint8 removeType) external nonReentrant {
        // 安全检查：只允许游戏桌合约自己调用此函数
        if (msg.sender != tableAddr) revert OnlyTableContractCanRemoveItself();

        // 查找游戏桌在数组中的位置
        uint256 index = type(uint256).max;
        for (uint256 i = 0; i < tableAddresses.length; i++) {
            if (tableAddresses[i] == tableAddr) {
                index = i;
                break;
            }
        }

        // 确保找到了游戏桌
        if (index == type(uint256).max) revert TableNotFound();

        // 从数组中移除（通过将最后一个元素移到要删除的位置，然后删除最后一个元素）
        if (index < tableAddresses.length - 1) {
            tableAddresses[index] = tableAddresses[tableAddresses.length - 1];
        }
        tableAddresses.pop();

        // 获取游戏桌的庄家地址
        address bankerAddr = gameTables[tableAddr].bankerAddr();

        // 从映射中删除
        delete gameTables[tableAddr];

        // 减少用户创建的房间数量
        if (userCreatedRoomsCount[bankerAddr] > 0) {
            userCreatedRoomsCount[bankerAddr]--;
        }

        if (removeType == 1){
            // 将被清算的游戏桌地址添加到已清算的游戏桌列表中
            liquidatedTableAddresses.push(tableAddr);
        }else if(removeType == 2){
            // 将被清算的游戏桌地址添加到已结算的游戏桌列表中
            disbandedTableAddresses.push(tableAddr);
        }


        emit GameTableRemoved(tableAddr);
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
            BBGameTableImplementation gameTable = gameTables[tableAddr];
            // 直接从合约实例获取信息
            tables[i] = gameTable.getTableInfo();
        }

        return tables;
    }

    /**
     * @dev 获取所有非活跃可被清算的游戏桌信息
     * @return 返回游戏桌信息数组
     */
    function getAllGameTablesInactive() external view returns(GameTableView[] memory) {
        uint256 tableCount = tableAddresses.length;
        GameTableView[] memory tempTables = new GameTableView[](tableCount);
        uint256 validCount = 0;

        for (uint256 i = 0; i < tableCount; i++) {
            address tableAddr = tableAddresses[i];
            BBGameTableImplementation gameTable = gameTables[tableAddr];
            //超过清算时间并且游戏在进行中的table可以被清算
            if(gameTable.lastActivityTimestamp() + gameTable.tableInactiveTimeout() < block.timestamp &&
            (gameTable.state() == BBTypes.GameState.FIRST_BETTING && gameTable.state() == BBTypes.GameState.SECOND_BETTING)){
                tempTables[i] = gameTable.getTableInfo();
                validCount++;
            }
        }

        // 创建一个新的数组来存储有效元素
        GameTableView[] memory tables = new GameTableView[](validCount);
        for (uint256 i = 0; i < validCount; i++) {
            tables[i] = tempTables[i];
        }

        return tables;
    }

    /**
     * @dev 获取指定地址的游戏桌信息
     * @param tableAddr 游戏桌合约地址
     * @return 返回游戏桌信息
     */
    function getGameTableInfo(address tableAddr) external view returns (GameTableView memory) {
        if (tableAddr == address(0)) revert TableDoesNotExist();
        BBGameTableImplementation gameTable = gameTables[tableAddr];
        return gameTable.getTableInfo();
    }

    /**
     * @dev 获取我参与的赌桌
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
        if (tableAddr == address(0) || address(gameTables[tableAddr]) == address(0)) revert TableDoesNotExist();
        BBGameTableImplementation gameTable = gameTables[tableAddr];
        return gameTable.getTableInfo();
    }

    // 验证游戏桌是否合法
    function isValidGameTable(address tableAddr) external view returns (bool) {
        return address(gameTables[tableAddr]) == tableAddr;
    }

    //设置游戏历史记录合约地址
    function setGameHistoryAddress(address _gameHistoryAddress) external onlyOwner nonReentrant{
        if (_gameHistoryAddress == address(0)) revert InvalidGameHistoryAddress();
        gameHistoryAddress = _gameHistoryAddress;
    }

    //设置奖励池合约地址
    function setRewardPoolAddress(address _rewardPoolAddress) external onlyOwner nonReentrant{
        if (_rewardPoolAddress == address(0)) revert InvalidRewardPoolAddress();
        rewardPoolAddress = _rewardPoolAddress;

        // 设置奖励池合约的游戏主合约地址
        BBRewardPool rewardPool = BBRewardPool(payable(rewardPoolAddress));
        rewardPool.setGameMainAddress(address(this));

        emit RewardPoolAddressUpdated(_rewardPoolAddress);
    }

    /**
     * @dev 庄家为游戏桌设置奖励池
     * @param tableAddr 游戏桌地址
     * @param poolId 奖励池ID
     */
    function setTableRewardPool(address tableAddr, uint256 poolId) external nonReentrant {
        // 验证游戏桌地址
        if (address(gameTables[tableAddr]) != tableAddr) revert TableDoesNotExist();

        // 验证奖励池合约地址
        if (rewardPoolAddress == address(0)) revert InvalidRewardPoolAddress();

        // 调用奖励池合约的设置函数
        BBRewardPool rewardPool = BBRewardPool(payable(rewardPoolAddress));
        rewardPool.setTableRewardPool(tableAddr, poolId);
    }

    /**
     * @dev 庄家移除游戏桌的奖励池
     * @param tableAddr 游戏桌地址
     */
    function removeTableRewardPool(address tableAddr) external nonReentrant {
        // 验证游戏桌地址
        if (address(gameTables[tableAddr]) != tableAddr) revert TableDoesNotExist();

        // 验证奖励池合约地址
        if (rewardPoolAddress == address(0)) revert InvalidRewardPoolAddress();

        // 调用奖励池合约的移除函数
        BBRewardPool rewardPool = BBRewardPool(payable(rewardPoolAddress));
        rewardPool.removeTableRewardPool(tableAddr);
    }

    /**
     * @dev 设置游戏桌工厂合约地址
     * @param _gameTableFactoryAddress 游戏桌工厂合约地址
     */
    function setGameTableFactoryAddress(address _gameTableFactoryAddress) external onlyOwner nonReentrant {
        if (_gameTableFactoryAddress == address(0)) revert InvalidAddress();
        gameTableFactoryAddress = _gameTableFactoryAddress;
        emit GameTableFactoryAddressUpdated(_gameTableFactoryAddress);
    }

    /**
     * @dev 升级游戏桌实现合约
     * @param _implementation 新的实现合约地址
     */
    function upgradeGameTableImplementation(address _implementation) external onlyOwner nonReentrant {
        if (_implementation == address(0)) revert InvalidAddress();
        if (gameTableFactoryAddress == address(0)) revert InvalidGameTableFactoryAddress();

        // 调用工厂合约的升级函数
        BBGameTableFactory factory = BBGameTableFactory(gameTableFactoryAddress);
        factory.updateImplementation(_implementation);

        emit GameTableImplementationUpgraded(_implementation, factory.version());
    }

    /**
     * @dev 设置随机数管理器地址
     * @param _randomnessManagerAddress 随机数管理器地址
     */
    function setRandomnessManagerAddress(address _randomnessManagerAddress) external onlyOwner nonReentrant {
        if (_randomnessManagerAddress == address(0)) revert InvalidAddress();
        randomnessManagerAddress = _randomnessManagerAddress;

        // 设置随机数管理器的游戏主合约地址
        // BBRandomnessManager randomnessManager = BBRandomnessManager(_randomnessManagerAddress);
        // randomnessManager.setGameMainAddress(address(this));

        // 如果已经有游戏桌，为所有游戏桌设置随机数管理器地址
        // for (uint256 i = 0; i < tableAddresses.length; i++) {
        //     address tableAddr = tableAddresses[i];
        //     BBGameTableImplementation gameTable = gameTables[tableAddr];
        //     gameTable.setRandomnessManagerAddress(_randomnessManagerAddress);
        // }

        emit RandomnessManagerAddressUpdated(_randomnessManagerAddress);
    }



    /**
     * @dev 设置房间等级合约地址
     * @param _roomLevelAddress 房间等级合约地址
     */
    function setRoomLevelAddress(address _roomLevelAddress) external onlyOwner nonReentrant {
        if (_roomLevelAddress == address(0)) revert InvalidRoomLevelAddress();
        roomLevelAddress = _roomLevelAddress;

        // 设置房间等级合约的游戏主合约地址
        BBRoomLevel roomLevel = BBRoomLevel(payable(roomLevelAddress));
        roomLevel.setGameMainAddress(address(this));

        emit RoomLevelAddressUpdated(_roomLevelAddress);
    }

    /**
     * @dev 启用或禁用房间等级功能
     * @param _enabled 是否启用
     */
    function setRoomLevelEnabled(bool _enabled) external onlyOwner {
        roomLevelEnabled = _enabled;
        emit RoomLevelEnabledUpdated(_enabled);
    }

    /**
     * @dev 获取用户拥有的房间等级信息
     * @param userAddress 用户地址
     * @return hasLevel 是否拥有房间等级
     * @return levelDetails 房间等级详细信息数组
     * @return totalMaxRooms 用户可创建的房间总数
     */
    function getUserRoomLevel(address userAddress) external view returns (
        bool hasLevel,
        BBRoomLevel.LevelDetails[] memory levelDetails,
        uint256 totalMaxRooms
    ) {
        if (roomLevelAddress == address(0)) return (false, new BBRoomLevel.LevelDetails[](0), 0);

        BBRoomLevel roomLevel = BBRoomLevel(payable(roomLevelAddress));
        hasLevel = roomLevel.hasRoomLevel(userAddress);

        if (hasLevel) {
            levelDetails = roomLevel.getUserLevelDetails(userAddress);
            totalMaxRooms = roomLevel.getMaxRooms(userAddress);
        } else {
            levelDetails = new BBRoomLevel.LevelDetails[](0);
            totalMaxRooms = 0;
        }

        return (hasLevel, levelDetails, totalMaxRooms);
    }

    /**
     * @dev 获取用户创建的房间数量
     * @param userAddress 用户地址
     * @return 用户创建的房间数量
     */
    function getUserCreatedRoomsCount(address userAddress) public view returns (uint256) {
        return userCreatedRoomsCount[userAddress];
    }

    /**
     * @dev 获取用户拥有的房卡信息
     * @param userAddress 用户地址
     * @return hasCard 是否拥有房卡
     * @return cardDetails 房卡详细信息数组
     */
    function getUserRoomCards(address userAddress) external view returns (bool hasCard, BBRoomCard.CardDetails[] memory cardDetails) {
        if (roomCardAddress == address(0)) return (false, new BBRoomCard.CardDetails[](0));

        BBRoomCard roomCard = BBRoomCard(payable(roomCardAddress));
        hasCard = roomCard.hasRoomCard(userAddress);

        if (hasCard) {
            cardDetails = roomCard.getRoomCardsByOwner(userAddress);
        } else {
            cardDetails = new BBRoomCard.CardDetails[](0);
        }

        return (hasCard, cardDetails);
    }

    // 授权升级
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev 重新计算所有用户创建的房间数量（仅在合约升级后需要时使用）
     * @notice 这个函数可能会消耗大量的gas，只应在必要时调用
     */
    function recalculateAllUserRoomCounts() external onlyOwner nonReentrant {
        // 首先收集所有庄家地址
        address[] memory bankers = new address[](tableAddresses.length);
        uint256 bankersCount = 0;

        // 遍历所有游戏桌，收集庄家地址
        for (uint256 i = 0; i < tableAddresses.length; i++) {
            address bankerAddr = gameTables[tableAddresses[i]].bankerAddr();
            bool found = false;

            // 检查庄家是否已经在列表中
            for (uint256 j = 0; j < bankersCount; j++) {
                if (bankers[j] == bankerAddr) {
                    found = true;
                    break;
                }
            }

            // 如果庄家不在列表中，添加到列表
            if (!found) {
                bankers[bankersCount] = bankerAddr;
                bankersCount++;
            }
        }

        // 重置所有庄家的房间计数
        for (uint256 i = 0; i < bankersCount; i++) {
            userCreatedRoomsCount[bankers[i]] = 0;
        }

        // 重新计算每个庄家的房间数量
        for (uint256 i = 0; i < tableAddresses.length; i++) {
            address bankerAddr = gameTables[tableAddresses[i]].bankerAddr();
            userCreatedRoomsCount[bankerAddr]++;
        }
    }

    /**
     * @dev 需要接收资金的合约必须要实现的函数
     */
    receive() external payable {}

    // 事件定义
    event GameTableCreated(address indexed tableAddr, address indexed banker, uint256 betAmount, uint8 maxPlayers, uint256 roomCardTokenId);
    event GameTableRemoved(address indexed tableAddr);
    event GameConfigUpdated(uint256 minBet, uint8 maxPlayers);
    event RoomCardAddressUpdated(address indexed roomCardAddress);
    event RoomCardEnabledUpdated(bool enabled);
    event RoomLevelAddressUpdated(address indexed roomLevelAddress);
    event RoomLevelEnabledUpdated(bool enabled);
    event RewardPoolAddressUpdated(address indexed rewardPoolAddress);
    event GameTableFactoryAddressUpdated(address indexed gameTableFactoryAddress);
    event GameTableImplementationUpgraded(address indexed implementation, uint256 version);
    event RandomnessManagerAddressUpdated(address indexed randomnessManagerAddress);
}

