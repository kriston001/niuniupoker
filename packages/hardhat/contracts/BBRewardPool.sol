// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBTypes.sol";
import "./BBVersion.sol";
import "./BBStructs.sol";
import "./BBInterfaces.sol";

/**
 * @title BBRewardPool
 * @dev 牛牛游戏奖励池合约，允许庄家创建奖励池，在游戏结束时随机奖励玩家
 */
contract BBRewardPool is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    

    // 状态变量
    uint256 private nextPoolId;                           // 下一个奖励池ID
    mapping(address => RewardPoolInfo[]) private bankerPools;      // 庄家拥有的奖励池

    // 游戏主合约地址
    address public gameMainAddr;

    // 最大概率值（100 = 100%）
    uint8 private constant MAX_PROBABILITY = 100;

    // 预留 50 个 slot 给将来新增变量用，防止存储冲突
    uint256[50] private __gap;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev 初始化函数，替代构造函数
     * @param _gameMainAddr 游戏主合约地址
     */
    function initialize(address _gameMainAddr) public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        require(_gameMainAddr != address(0), "Invalid game main address");
        gameMainAddr = _gameMainAddr;
        nextPoolId = 1;
    }

    /**
     * @dev 创建新的奖励池
     * @param name 奖励池名称
     * @param _totalReward 总奖励金额
     * @param _rewardPerGame 每局游戏奖励金额
     * @param _winProbability 中奖概率（以百分之一为单位，例如10表示10%的概率）
     */
    function createRewardPool(string calldata name, uint256 _totalReward, uint256 _rewardPerGame, uint256 _winProbability) external payable nonReentrant {
        // 验证参数
        require(_rewardPerGame > 0 && _totalReward > 0, "Invalid reward amount");
        require(_winProbability > 0 && _winProbability <= MAX_PROBABILITY, "Invalid win probability");
        require(msg.value == _totalReward, "Insufficient funds");

        // 创建奖励池
        RewardPoolInfo memory pool;
        pool.name = name;
        pool.poolId = nextPoolId++;
        pool.banker = msg.sender;
        pool.totalAmount = _totalReward;
        pool.rewardPerGame = _rewardPerGame;
        pool.winProbability = _winProbability;
        pool.remainingAmount = _totalReward;
        pool.__gap = [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)];

        // 添加到庄家的奖励池列表
        bankerPools[msg.sender].push(pool);

        emit RewardPoolCreated(pool.poolId, msg.sender, msg.value, _rewardPerGame, _winProbability);
    }

    //验证是否是这个庄家的奖励池
    function isBankerPool(address _banker, uint256 _poolId) external view returns (bool) {
        RewardPoolInfo[] memory pools = bankerPools[_banker];
        for (uint256 i = 0; i < pools.length; i++) {
            if (pools[i].poolId == _poolId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev 庄家删除奖励池并取回剩余资金
     * @param _poolId 要删除的奖励池ID
     */
    function removeRewardPool(uint256 _poolId) external nonReentrant {
        RewardPoolInfo[] storage pools = bankerPools[msg.sender];
        require(pools.length > 0, "Reward pool not active");
        
        // 查找并验证奖励池
        uint256 poolIndex = type(uint256).max;
        for (uint256 i = 0; i < pools.length; i++) {
            if (pools[i].poolId == _poolId) {
                poolIndex = i;
                break;
            }
        }
        
        require(poolIndex != type(uint256).max, "Reward pool not active");

        if(IGameMain(gameMainAddr).rewardPoolIsInUse(msg.sender, _poolId)){
            require(false, "Reward pool in use");
        }
        
        RewardPoolInfo storage pool = pools[poolIndex];
        uint256 remainingAmount = pool.remainingAmount;

        // 从数组中移除奖励池（通过将最后一个元素移到要删除的位置）
        if (poolIndex != pools.length - 1) {
            pools[poolIndex] = pools[pools.length - 1];
        }
        pools.pop();

        if(remainingAmount > 0){
            // 转账剩余资金给庄家
            (bool success, ) = payable(msg.sender).call{value: remainingAmount}("");
            require(success, "Transfer failed");
        }
        

        emit RewardPoolRemoved(_poolId, msg.sender, remainingAmount);
    }

    /**
     * @dev 游戏结束时尝试分配奖励
     * @param _poolId 游戏桌地址
     * @param _players 参与游戏的玩家地址数组
     * @param finalSeed 最终种子
     * @return 是否分配了奖励
     */
    function tryDistributeReward(uint256 _poolId, address[] calldata _players, uint256 finalSeed) external nonReentrant returns (address, uint256) {
        address tableAddr = msg.sender;
        address bankerAddr = IGameTableImplementation(tableAddr).bankerAddr();
        require(bankerAddr != address(0), "invalid banker address");

        RewardPoolInfo storage pool = bankerPools[bankerAddr][_poolId];
        if (pool.poolId == 0) return (address(0), 0);

        // 验证有足够的资金
        if (pool.remainingAmount < pool.rewardPerGame) return (address(0), 0);

        // 验证有玩家参与
        if (_players.length == 0) return (address(0), 0);

        // 生成随机数决定是否发放奖励
        uint256 randomValue = _generateRandomNumber(finalSeed, _poolId, tableAddr) % MAX_PROBABILITY;

        // 如果随机数小于中奖概率，则发放奖励
        if (randomValue < pool.winProbability) {
            // 随机选择一名玩家
            uint256 winnerIndex = _generateRandomNumber(finalSeed, _poolId + 1, tableAddr) % _players.length;
            address winner = _players[winnerIndex];

            // 更新奖励池余额
            pool.remainingAmount -= pool.rewardPerGame;

            // 转账奖励给获胜者
            (bool success, ) = payable(winner).call{value: pool.rewardPerGame}("");
            require(success, "Transfer failed");

            emit RewardDistributed(_poolId, tableAddr, winner, pool.rewardPerGame);
            return (winner, pool.rewardPerGame);
        }

        return (address(0), 0);

    }

    /**
     * @dev 获取指定地址的所有奖励池
     * @param _banker 庄家地址
     * @return 奖励池信息数组
     */
    function getBankerPools(address _banker) external view returns (RewardPoolInfo[] memory) {
        return bankerPools[_banker];
    }

    /**
     * @dev 获取指定庄家的指定奖励池信息
     * @param _banker 庄家地址
     * @param _poolId 奖励池ID
     * @return 奖励池信息
     */
    function getRewardPoolInfo(address _banker, uint256 _poolId) external view returns (RewardPoolInfo memory) {
        RewardPoolInfo[] memory pools = bankerPools[_banker];
        for (uint256 i = 0; i < pools.length; i++) {
            if (pools[i].poolId == _poolId) {
                return pools[i];
            }
        }
        return RewardPoolInfo(0, "", address(0), 0, 0, 0, 0, [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)]);
    }

    /**
     * @dev 更新奖励池的剩余金额（内部函数）
     * @param _banker 庄家地址
     * @param _poolId 奖励池ID
     * @param _amount 要减少的金额
     */
    function _updateRewardPoolAmount(address _banker, uint256 _poolId, uint256 _amount) internal {
        RewardPoolInfo[] storage pools = bankerPools[_banker];
        for (uint256 i = 0; i < pools.length; i++) {
            if (pools[i].poolId == _poolId) {
                require(pools[i].remainingAmount >= _amount, "Insufficient funds");
                pools[i].remainingAmount -= _amount;
                return;
            }
        }
        require(false, "Reward pool not active");
    }

    /**
     * @dev 生成随机数（内部函数）
     * @param _seed1 种子
     * @param _seed2 种子
     * @param _seed3 种子
     * @return 伪随机数
     */
    function _generateRandomNumber(uint256 _seed1, uint256 _seed2, address _seed3) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            _seed1,
            _seed2,
            _seed3,
            block.timestamp,
            block.difficulty,
            blockhash(block.number - 1)
        )));
    }

    /**
     * @dev 设置游戏主合约地址
     * @param _gameMainAddr 新的游戏主合约地址
     */
    function setGameMainAddress(address _gameMainAddr) external onlyOwner {
        require(_gameMainAddr != address(0), "Invalid game main address");
        gameMainAddr = _gameMainAddr;
        emit GameMainAddressUpdated(_gameMainAddr);
    }

    /**
     * @dev 实现UUPS可升级合约所需的授权检查
     * @param newImplementation 新的实现合约地址
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // 事件定义
    event RewardPoolCreated(uint256 indexed poolId, address indexed banker, uint256 totalAmount, uint256 rewardPerGame, uint256 winProbability);
    event RewardPoolRemoved(uint256 indexed poolId, address indexed banker, uint256 remainingAmount);
    event TableRewardPoolSet(address indexed tableAddr, uint256 indexed poolId, address indexed banker);
    event TableRewardPoolRemoved(address indexed tableAddr, uint256 indexed poolId, address indexed banker);
    event RewardDistributed(uint256 indexed poolId, address indexed tableAddr, address indexed winner, uint256 amount);
    event GameMainAddressUpdated(address indexed gameMainAddr);

    
}
