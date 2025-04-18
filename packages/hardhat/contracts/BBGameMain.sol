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
import "./BBRoomCardNFT.sol";
import "./BBRewardPool.sol";
import "./BBRoomLevelNFT.sol";
import "./BBRandomnessManager.sol";
import "./BBStructs.sol";



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
    uint256 public maxBankerFeePercent; // 庄家抽成最大百分比
    uint256 public liquidatorFeePercent; // 清算人费用百分比


    // 游戏桌地址列表
    address[] private tableAddresses;
    mapping(address => BBGameTableImplementation) public gameTables;
    // 用户创建的游戏桌映射
    mapping(address => address[]) private userTables;

    // 记录每个用户创建的房间数量
    mapping(address => uint256) private userCreatedRoomsCount;

    address public gameHistoryAddress;  // 游戏历史记录合约地址
    address public rewardPoolAddress;    // 奖励池合约地址


    // 房卡相关
    address public roomCardAddress;  // 房卡NFT合约地址

    // 房间等级相关
    address public roomLevelAddress; // 房间等级合约地址

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
     * @param bankerFeePercent 庄家抽成百分比
     */
    function createGameTable(
        string memory tableName,
        uint256 betAmount,
        uint8 tableMaxPlayers,
        uint256 bankerFeePercent

    ) external payable nonReentrant {
        if (paused()) revert ContractPaused();
        if (betAmount < minBet) revert BetAmountTooSmall();
        if (tableMaxPlayers <= 1 || tableMaxPlayers > maxPlayers) revert InvalidMaxPlayers();
        if (bankerFeePercent > maxBankerFeePercent) revert InvalidBankerFeePercent();

        // 将玩家的房间数量加1
        userCreatedRoomsCount[msg.sender]++;

        uint256 createdRooms = getUserCreatedRoomsCount(msg.sender);
        // 验证用户的房间等级和已创建的房间数量
        if (createdRooms > maxRoomCount) {
            if (roomLevelAddress == address(0)) revert InvalidRoomLevelAddress();

            // 验证用户是否拥有房间等级
            BBRoomLevelNFT roomLevel = BBRoomLevelNFT(payable(roomLevelAddress));
            if (!roomLevel.hasNft(msg.sender)) revert RoomLevelRequired();

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
        // if (roomCardEnabled) {
        //     if (roomCardAddress == address(0)) revert InvalidRoomCardContract();

        //     // 验证用户是否拥有房卡
        //     BBRoomCardNFT roomCard = BBRoomCardNFT(payable(roomCardAddress));
        //     if (!roomCard.hasNft(msg.sender)) revert NoRoomCardOwned();

        //     // 验证房卡参数是否符合游戏设置
        //     if (!roomCard.validateParams(roomCardTokenId, betAmount, tableMaxPlayers)) {
        //         revert InvalidRoomCardParams();
        //     }

        //     // 消耗房卡
        //     try roomCard.consume(msg.sender, roomCardTokenId) {
        //         // 房卡消耗成功
        //     } catch {
        //         revert RoomCardConsumptionFailed();
        //     }
        // }

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
            bankerFeePercent
        ));


        // 添加到活跃游戏列表
        tableAddresses.push(tableAddr);
        gameTables[tableAddr] = BBGameTableImplementation(tableAddr);
        // 添加到用户的游戏桌列表
        userTables[msg.sender].push(tableAddr);

        // 触发事件
        emit GameTableCreated(tableAddr, msg.sender, betAmount, tableMaxPlayers, bankerFeePercent);
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

    function getGameConfig() external view returns (GameConfig memory) {
        return GameConfig({
            minBet: minBet,
            maxPlayers: maxPlayers,
            maxBankerFeePercent: maxBankerFeePercent,
            playerTimeout: playerTimeout,
            tableInactiveTimeout: tableInactiveTimeout,
            liquidatorFeePercent: liquidatorFeePercent,
            gameHistoryAddress: gameHistoryAddress,
            rewardPoolAddress: rewardPoolAddress,
            randomnessManagerAddress: randomnessManagerAddress,
            roomCardAddress: roomCardAddress,
            roomLevelAddress: roomLevelAddress,
            gameTableFactoryAddress: gameTableFactoryAddress
        });
    }

    /**
     * @dev 更新游戏配置（仅限合约拥有者）
     */
    function updateGameConfig(
        uint256 _minBet,
        uint8 _maxPlayers,
        uint256 _maxBankerFeePercent,
        uint256 _playerTimeout,
        uint256 _tableInactiveTimeout,
        uint256 _liquidatorFeePercent
    ) external onlyOwner {
        if (_minBet == 0) revert MinBetMustBePositive();
        if (_maxPlayers <= 1) revert MaxPlayersTooSmall();
        if (_maxBankerFeePercent == 0) revert BankerFeePercentMustBePositive();
        if (_playerTimeout == 0) revert PlayerTimeoutMustBePositive();
        if (_tableInactiveTimeout == 0) revert TableInactiveTimeoutMustBePositive();
        if (_liquidatorFeePercent == 0) revert InvalidLiquidatorFeePercent();

        minBet = _minBet;
        maxPlayers = _maxPlayers;
        maxBankerFeePercent = _maxBankerFeePercent;
        playerTimeout = _playerTimeout;
        tableInactiveTimeout = _tableInactiveTimeout;
        liquidatorFeePercent = _liquidatorFeePercent;

        emit GameConfigUpdated(_minBet, _maxPlayers);
    }

    /**
     * @dev 设置房卡合约地址
     * @param _roomCardAddress 房卡合约地址
     */
    function setRoomCardAddress(address _roomCardAddress) external onlyOwner {
        if (_roomCardAddress == address(0)) revert InvalidRoomCardContract();
        roomCardAddress = _roomCardAddress;

        emit RoomCardAddressUpdated(_roomCardAddress);
    }


    /**
     * @dev 获取最新的游戏桌
     * @return 获取最新的游戏桌
     */
    function getNewestGameTables(uint8 _count) external view returns(GameTableView[] memory) {
        uint256 tableCount = tableAddresses.length;
        
        //获取最新的游戏桌
        if(tableCount > _count){
            tableCount = _count;
        }
        GameTableView[] memory tables = new GameTableView[](tableCount);

        //获取tableAddresses中最新的16个游戏桌
        for (uint256 i = 0; i < tableCount; i++) {
            address tableAddr = tableAddresses[tableAddresses.length - i - 1];
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
            (gameTable.state() == GameState.FIRST_BETTING && gameTable.state() == GameState.SECOND_BETTING)){
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
        return _getTableInfo(tableAddr);
    }

    /**
     * @dev 获取我参与的赌桌
     * @return 返回游戏桌信息
     */
    function getMyGameTables() external view returns (GameTableView[] memory) {
        uint256 tableCount = userTables[msg.sender].length;
        GameTableView[] memory tables = new GameTableView[](tableCount);

        for (uint256 i = 0; i < tableCount; i++) {
            address tableAddr = userTables[msg.sender][i];
            tables[i] = _getTableInfo(tableAddr);
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

    function rewardPoolIsInUse(address _bankerAddr, uint256 _poolId) external view returns (bool) {
        BBGameTableImplementation[] tables = gameTables[_bankerAddr];
        for (uint256 i = 0; i < tables.length; i++) {
            address tableAddr = tableAddresses[i];
            if (tables[tableAddr].bankerAddr() == _bankerAddr && tables[tableAddr].rewardPoolId() == _poolId) {
                return true;
            }
        }
        return false;
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
     * @dev 设置随机数管理器地址
     * @param _randomnessManagerAddress 随机数管理器地址
     */
    function setRandomnessManagerAddress(address _randomnessManagerAddress) external onlyOwner nonReentrant {
        if (_randomnessManagerAddress == address(0)) revert InvalidAddress();
        randomnessManagerAddress = _randomnessManagerAddress;

        emit RandomnessManagerAddressUpdated(_randomnessManagerAddress);
    }


    /**
     * @dev 设置房间等级合约地址
     * @param _roomLevelAddress 房间等级合约地址
     */
    function setRoomLevelAddress(address _roomLevelAddress) external onlyOwner nonReentrant {
        if (_roomLevelAddress == address(0)) revert InvalidRoomLevelAddress();
        roomLevelAddress = _roomLevelAddress;

        emit RoomLevelAddressUpdated(_roomLevelAddress);
    }



    /**
     * @dev 获取用户创建的房间数量
     * @param userAddress 用户地址
     * @return 用户创建的房间数量
     */
    function getUserCreatedRoomsCount(address userAddress) public view returns (uint256) {
        return userCreatedRoomsCount[userAddress];
    }



    // 授权升级
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    

    /**
     * @dev 需要接收资金的合约必须要实现的函数
     */
    receive() external payable {}

    // 事件定义
    event GameTableCreated(address indexed tableAddr, address indexed banker, uint256 betAmount, uint8 maxPlayers, uint256 bankerFeePercent);
    event GameTableRemoved(address indexed tableAddr);
    event GameConfigUpdated(uint256 minBet, uint8 maxPlayers);
    event RoomCardAddressUpdated(address indexed roomCardAddress);
    event RoomLevelAddressUpdated(address indexed roomLevelAddress);
    event RewardPoolAddressUpdated(address indexed rewardPoolAddress);
    event GameTableFactoryAddressUpdated(address indexed gameTableFactoryAddress);
    event GameTableImplementationUpgraded(address indexed implementation, uint256 version);
    event RandomnessManagerAddressUpdated(address indexed randomnessManagerAddress);
}

