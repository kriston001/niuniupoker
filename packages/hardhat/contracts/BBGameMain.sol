// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBTypes.sol";
import "./BBRoomCardNFT.sol";
import "./BBRewardPool.sol";
import "./BBRoomLevelNFT.sol";
import "./BBStructs.sol";
import "./BBInterfaces.sol";



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
    uint256 public nextTableId;
    uint8 public maxRoomCount;  //最大创建房间数
    uint8 public maxJoinTablesCount; // 最大加入游戏桌数
    uint8 public maxPlayers;
    uint256 public playerTimeout;  // 玩家超时时间
    uint256 public tableInactiveTimeout;  // 游戏桌不活跃超时时间
    uint8 public maxBankerFeePercent; // 庄家抽成最大百分比
    uint8 public liquidatorFeePercent; // 清算人费用百分比


    // 游戏桌地址列表
    address[] public tableAddresses;
    mapping(address => address) public gameTables;

    // 用户信息，包含用户创建的table和加入的table数据
    mapping(address => UserInfo) private userInfos;

    address public rewardPoolAddress;    // 奖励池合约地址


    // 房卡相关
    address public roomCardAddress;  // 房卡NFT合约地址

    // 房间等级相关
    address public roomLevelAddress; // 房间等级合约地址

    // 游戏桌工厂相关
    address public gameTableFactoryAddress; // 游戏桌工厂合约地址


    // 预留 50 个 slot 给将来新增变量用，防止存储冲突
    uint256[50] private __gap;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev 初始化函数，替代构造函数
     */
    function initialize(
        uint8 _maxPlayers,
        uint8 _maxRoomCount,
        uint8 _maxJoinTablesCount,
        uint8 _maxBankerFeePercent,
        uint8 _liquidatorFeePercent,
        uint256 _playerTimeout,
        uint256 _tableInactiveTimeout,
        address _gameTableFactoryAddress
    ) public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        nextTableId = 1;
        maxPlayers = _maxPlayers;
        maxRoomCount = _maxRoomCount;
        maxJoinTablesCount = _maxJoinTablesCount;
        maxBankerFeePercent = _maxBankerFeePercent;
        liquidatorFeePercent = _liquidatorFeePercent;
        playerTimeout = _playerTimeout;
        tableInactiveTimeout = _tableInactiveTimeout;

        // 初始化游戏桌工厂地址
        if (_gameTableFactoryAddress != address(0)) {
            gameTableFactoryAddress = _gameTableFactoryAddress;
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
        uint8 bankerFeePercent,
        uint8 firstRaise,
        uint8 secondRaise,
        uint256 rewardPoolId
    ) external payable nonReentrant {
        require(!paused(), "Contract paused");
        require(betAmount != 0, "Bet amount too small");
        require(tableMaxPlayers > 1 && tableMaxPlayers <= maxPlayers, "Invalid max players");
        require(bankerFeePercent <= maxBankerFeePercent, "Invalid banker fee percent");
        require(bytes(tableName).length > 0 && bytes(tableName).length <= 20, "Invalid table name");
        require(firstRaise >= 1 && firstRaise <= 4, "Invalid first raise");
        require(secondRaise >= 1 && secondRaise <= 4, "Invalid second raise");

        uint256 createdRooms = getUserCreatedRoomsCount(msg.sender);
        // 验证用户的房间等级和已创建的房间数量
        if (createdRooms >= maxRoomCount) {
            require(roomLevelAddress != address(0), "Invalid room level address");

            // 验证用户是否拥有房间等级
            BBRoomLevelNFT roomLevel = BBRoomLevelNFT(payable(roomLevelAddress));
            require(roomLevel.hasNft(msg.sender), "Room level required");

            // 获取用户等等级NFT可创建的房间总数
            uint256 maxRooms = roomLevel.getMaxRooms(msg.sender);

            // 验证用户是否超过房间创建上限
            if (createdRooms >= maxRooms + maxRoomCount) {
                // 如果超过上限，先将计数减回去，再抛出错误
                require(false, "room level limit exceeded");
            }
        }

        // 检查游戏桌工厂地址是否设置
        require(gameTableFactoryAddress != address(0), "Invalid game table factory address");


        // 使用工厂合约创建游戏桌
        IGameTableFactory factory = IGameTableFactory(gameTableFactoryAddress);
        address tableAddr = factory.createGameTable(
            nextTableId,
            tableName,
            msg.sender,
            betAmount,
            tableMaxPlayers,
            address(this),
            bankerFeePercent,
            firstRaise,
            secondRaise,
            rewardPoolId
        );

        nextTableId++;
        
        // 添加到活跃游戏列表
        tableAddresses.push(tableAddr);
        gameTables[tableAddr] = tableAddr;

        //添加到用户的游戏桌列表
        UserInfo storage userInfo = userInfos[msg.sender];
        userInfo.tables.push(tableAddr);

        // 触发事件
        emit GameTableCreated(tableAddr, msg.sender, betAmount, tableMaxPlayers, bankerFeePercent);
    }

    // 获取tableAddresses列表
    function getTableAddresses() external view returns (address[] memory) {
        return tableAddresses;
    }

    function getUserJoinedTablesCount(address userAddr) public view returns (uint8){
        UserInfo storage user = userInfos[userAddr];
        uint8 count = 0;
        for (uint i = 0; i < user.joinedTables.length; i++) {
            if (user.joinedTables[i] != address(0)) {
                count++;
            }
        }

        return count;
    }

    /// @notice 用户加入某个游戏桌
    function userJoinTable(address userAddr) external {
        address tableAddr = msg.sender;
        require(gameTables[tableAddr] == tableAddr, "Invalid table address");
        

        uint8 joinedTableCount = getUserJoinedTablesCount(userAddr);
        require(joinedTableCount <= maxJoinTablesCount, "Max join tables count exceeded");

        UserInfo storage user = userInfos[userAddr];
        require(user.joinedTableIndex[tableAddr] == 0, "User Already joined");

        // 查找空位（address(0)）
        bool reused = false;
        for (uint i = 0; i < user.joinedTables.length; i++) {
            if (user.joinedTables[i] == address(0)) {
                user.joinedTables[i] = tableAddr;
                user.joinedTableIndex[tableAddr] = i + 1;
                reused = true;
                break;
            }
        }

        // 没有空位则 push
        if (!reused) {
            user.joinedTables.push(tableAddr);
            user.joinedTableIndex[tableAddr] = user.joinedTables.length; // index + 1
        }
    }

    /// @notice 用户退出某个游戏桌
    function userLeaveTable(address userAddr) external {
        address tableAddr = msg.sender;
        require(gameTables[tableAddr] == tableAddr, "Invalid table address");

        UserInfo storage user = userInfos[userAddr];
        uint index = user.joinedTableIndex[tableAddr];
        require(index > 0, "User Not joined");

        // 懒清除：将地址置为 address(0)，不 pop
        user.joinedTables[index - 1] = address(0);
        delete user.joinedTableIndex[tableAddr];
    }

    /// @notice 获取用户已加入的桌子（过滤空位）
    function getUserJoinedTables(address userAddr) external view returns (GameTableInfoShort[] memory) {
        UserInfo storage user = userInfos[userAddr];

        uint8 joinedTableCount = getUserJoinedTablesCount(userAddr);

        GameTableInfoShort[] memory result = new GameTableInfoShort[](joinedTableCount);
        uint j = 0;
        for (uint i = 0; i < user.joinedTables.length; i++) {
            if (user.joinedTables[i] != address(0)) {
                result[j] = IGameTableImplementation(user.joinedTables[i]).getTableInfoShort();
                j++;
            }
        }

        return result;
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
            maxRoomCount: maxRoomCount,
            maxPlayers: maxPlayers,
            maxJoinTablesCount: maxJoinTablesCount,
            maxBankerFeePercent: maxBankerFeePercent,
            playerTimeout: playerTimeout,
            tableInactiveTimeout: tableInactiveTimeout,
            liquidatorFeePercent: liquidatorFeePercent,
            gameMainAddress: address(this),
            rewardPoolAddress: rewardPoolAddress,
            roomCardAddress: roomCardAddress,
            roomLevelAddress: roomLevelAddress,
            gameTableFactoryAddress: gameTableFactoryAddress
        });
    }

    /**
     * @dev 更新游戏配置（仅限合约拥有者）
     */
    function updateGameConfig(
        uint8 _maxPlayers,
        uint8 _maxJoinTablesCount,
        uint8 _maxBankerFeePercent,
        uint256 _playerTimeout,
        uint256 _tableInactiveTimeout,
        uint8 _liquidatorFeePercent
    ) external onlyOwner {
        require(_maxPlayers > 1, "Invalid max players");
        require(_maxBankerFeePercent != 0 && _maxBankerFeePercent < 100, "Banker fee percent must be positive");
        require(_playerTimeout != 0, "Player timeout must be positive");
        require(_tableInactiveTimeout != 0, "Table inactive timeout must be positive");
        require(_liquidatorFeePercent != 0 && _liquidatorFeePercent < 100, "Invalid liquidator fee percent");

        maxPlayers = _maxPlayers;
        maxJoinTablesCount = _maxJoinTablesCount;
        maxBankerFeePercent = _maxBankerFeePercent;
        playerTimeout = _playerTimeout;
        tableInactiveTimeout = _tableInactiveTimeout;
        liquidatorFeePercent = _liquidatorFeePercent;
    }

    /**
     * @dev 设置房卡合约地址
     * @param _roomCardAddress 房卡合约地址
     */
    function setRoomCardAddress(address _roomCardAddress) external onlyOwner {
        require(_roomCardAddress != address(0), "Invalid room card contract");
        roomCardAddress = _roomCardAddress;
    }


    /**
     * @dev 获取最新的游戏桌
     * @param _count 要获取的游戏桌数量
     * @return 最新的游戏桌数组
     */
    function getNewestGameTables(uint8 _count) external view returns(GameTableInfoShort[] memory) {
        require(_count > 0, "Count must be greater than 0");
        
        uint256 tableCount = tableAddresses.length;
        if (tableCount == 0) {
            return new GameTableInfoShort[](0);
        }
        
        // 如果请求的数量大于现有游戏桌数量，则使用现有数量
        uint256 resultCount = _count;
        if (tableCount < resultCount) {
            resultCount = tableCount;
        }
        
        GameTableInfoShort[] memory tables = new GameTableInfoShort[](resultCount);
        
        // 使用安全的索引计算方式
        uint256 startIndex = tableCount > resultCount ? tableCount - resultCount : 0;
        
        for (uint256 i = 0; i < resultCount; i++) {
            address tableAddr = tableAddresses[startIndex + i];
            IGameTableImplementation gameTable = IGameTableImplementation(tableAddr);
            tables[resultCount - 1 - i] = gameTable.getTableInfoShort(); // 反向填充保持最新的在前
        }
        
        return tables;
    }

    /**
     * @dev 获取所有非活跃可被清算的游戏桌信息
     * @return 返回游戏桌信息数组
     */
    function getAllGameTablesInactive() external view returns(GameTableInfoShort[] memory) {
        uint256 tableCount = tableAddresses.length;
        GameTableInfoShort[] memory tempTables = new GameTableInfoShort[](tableCount);
        uint256 validCount = 0;

        for (uint256 i = 0; i < tableCount; i++) {
            address tableAddr = tableAddresses[i];
            IGameTableImplementation gameTable = IGameTableImplementation(tableAddr);
            //超过清算时间并且游戏在进行中的table可以被清算
            if(gameTable.lastActivityTimestamp() + tableInactiveTimeout < block.timestamp &&
            (gameTable.state() == GameState.FIRST_BETTING || gameTable.state() == GameState.SECOND_BETTING)){
                tempTables[validCount] = gameTable.getTableInfoShort();
                validCount++;
            }
        }

        // 创建一个新的数组来存储有效元素
        GameTableInfoShort[] memory tables = new GameTableInfoShort[](validCount);
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
    function getGameTableInfo(address tableAddr) external view returns (GameTableInfoShort memory) {
        return _getTableInfo(tableAddr);
    }

    /**
     * @dev 获取我参与的赌桌
     * @param userAddr 用户地址
     * @return 返回游戏桌信息
     */
    function getUserGameTables(address userAddr) external view returns (GameTableInfoShort[] memory) {
        UserInfo storage userInfo = userInfos[userAddr];
        GameTableInfoShort[] memory tables = new GameTableInfoShort[](userInfo.tables.length);

        for (uint256 i = 0; i < userInfo.tables.length; i++) {
            address tableAddr = userInfo.tables[i];
            tables[i] = _getTableInfo(tableAddr);
        }

        return tables;
    }

    // 添加一个内部函数来获取游戏桌信息
    function _getTableInfo(address tableAddr) internal view returns (GameTableInfoShort memory) {
        require(tableAddr != address(0) && gameTables[tableAddr] != address(0), "Table does not exist");
        IGameTableImplementation gameTable = IGameTableImplementation(tableAddr);
        return gameTable.getTableInfoShort();
    }

    // 验证游戏桌是否合法
    function isValidGameTable(address tableAddr) external view returns (bool) {
        return address(gameTables[tableAddr]) == tableAddr;
    }

    //设置奖励池合约地址
    function setRewardPoolAddress(address _rewardPoolAddress) external onlyOwner nonReentrant{
        require(_rewardPoolAddress != address(0), "Invalid reward pool address");
        rewardPoolAddress = _rewardPoolAddress;
    }

    function rewardPoolIsInUse(address _bankerAddr, uint256 _poolId) external view returns (bool) {
        address[] storage tableAddrs = userInfos[_bankerAddr].tables;

        for (uint256 i = 0; i < tableAddrs.length; i++) {
            address tableAddr = tableAddrs[i];
            if (IGameTableImplementation(tableAddr).rewardPoolId() == _poolId) {
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
        require(_gameTableFactoryAddress != address(0), "Invalid game table factory address");
        gameTableFactoryAddress = _gameTableFactoryAddress;
    }


    /**
     * @dev 设置房间等级合约地址
     * @param _roomLevelAddress 房间等级合约地址
     */
    function setRoomLevelAddress(address _roomLevelAddress) external onlyOwner nonReentrant {
        require(_roomLevelAddress != address(0), "Invalid room level address");
        roomLevelAddress = _roomLevelAddress;
    }



    /**
     * @dev 获取用户创建的房间数量
     * @param userAddress 用户地址
     * @return 用户创建的房间数量
     */
    function getUserCreatedRoomsCount(address userAddress) public view returns (uint256) {
        return userInfos[userAddress].tables.length;
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
}
